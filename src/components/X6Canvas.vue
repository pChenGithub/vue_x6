<template>
  <div class="x6-canvas-container">
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <a-space>
        <a-button-group>
          <a-button @click="handleZoomIn">
            <template #icon><PlusOutlined /></template>
          </a-button>
          <a-button @click="handleZoomOut">
            <template #icon><MinusOutlined /></template>
          </a-button>
          <a-button @click="handleZoomReset">
            <template #icon><AimOutlined /></template>
          </a-button>
        </a-button-group>
        <span class="zoom-text">{{ Math.round(zoom * 100) }}%</span>
      </a-space>
      
      <a-space>
        <a-button 
          :type="showGrid ? 'primary' : 'default'"
          @click="handleToggleGrid"
        >
          <template #icon><BorderOutlined /></template>
          网格
        </a-button>
        <a-button @click="handleFitView">
          <template #icon><FullscreenExitOutlined /></template>
          适应画布
        </a-button>
        <a-button danger @click="handleClear">
          <template #icon><DeleteOutlined /></template>
          清空
        </a-button>
      </a-space>
    </div>
    
    <!-- 画布容器 -->
    <div 
      ref="containerRef" 
      class="x6-graph-container"
    />
    <!-- Vue 组件容器 -->
    <component :is="getTeleport()" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Graph, Node, Dnd } from '@antv/x6'
import { register, getTeleport } from '@antv/x6-vue-shape'
import { 
  PlusOutlined,
  MinusOutlined,
  AimOutlined,
  BorderOutlined,
  FullscreenExitOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { showMessage } from '@/utils/message'
import { useWorkflowStore } from '@/stores/workflowStore'
import { nodeConfigMap, portGroups, portItems } from '@/config/nodeConfig'
import { type PanelItem, type NodeData, NodeCategory } from '@/types/workflow'

// Store实例
const workflowStore = useWorkflowStore()

// DOM引用
const containerRef = ref<HTMLDivElement | null>(null)

// 图实例
let graph: Graph | null = null

// Dnd 插件实例
let dnd: Dnd | null = null

// 当前缩放级别
const zoom = ref(1)

// 是否显示网格
const showGrid = ref(true)

/**
 * 开始拖拽（供 ComponentPanel 调用）
 */
const startDrag = (event: DragEvent, item: PanelItem) => {
  if (!graph || !dnd) return
  
  const config = nodeConfigMap[item.type]
  if (!config) return
  
  // 创建用于拖拽预览的临时节点
  // 根据节点类型选择合适的 shape
  const node = graph.createNode({
    shape: item.type,
    data: { type: item.type, label: item.label,
      isContainer: NodeCategory.RELATION===item.category},
  })
  
  // 开始拖拽
  dnd.start(node, event)
}

/**
 * 初始化画布
 */
const initGraph = () => {
  if (!containerRef.value) return
  
  // 创建图形实例
  graph = new Graph({
    container: containerRef.value,
    // 自动适应容器大小
    autoResize: true,
    // 网格配置
    grid: {
      size: 20,
      visible: true,
      type: 'dot'
    },
    // 鼠标滚轮缩放
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta']
    },
    // 连线配置
    connecting: {
      snap: true,
      allowBlank: false,
      allowLoop: false,
      highlight: true,
      connector: 'rounded'
    },
    // 画布平移
    panning: {
      enabled: true
    },
    embedding: {
        enabled: true,
        findParent({ node }) {
          const bbox = node.getBBox()
          return this.getNodes().filter((node) => {
            const data = node.getData<NodeData>()
            if (data.isContainer) {
              const targetBBox = node.getBBox()
              return bbox.isIntersectWithRect(targetBBox)
            }
            return false
          })
        },
      },
  })
  
  // 注册节点
  registerNodes()
  
  // 初始化 Dnd 插件
  dnd = new Dnd({
    target: graph as Graph,
    // 获取拖拽节点的函数
    getDragNode: (sourceNode: Node) => {
      return sourceNode.clone()
    },
    // 获取放置节点的函数
    getDropNode: (draggingNode: Node) => {
      return draggingNode.clone()
    }
  })
  
  // 注册节点
  registerNodes()
  
  // 监听事件
  setupEventListeners()
  
  // 同步到Store
  workflowStore.setGraph(graph)
}

/**
 * 注册自定义节点
 */
const registerNodes = () => {
  if (!graph) return
  Object.values(nodeConfigMap).forEach((nodeConfig) => {
    // 注册时间条件 Vue 组件节点（继承 vue-shape）
    register({
      shape: nodeConfig.type,
      inherit: 'vue-shape',
      width: nodeConfig.width, height: nodeConfig.height, // 默认的尺寸
      component: nodeConfig.component,
      ports: {items: portItems, groups: portGroups},
    })
  })
}

/**
 * 设置事件监听
 */
const setupEventListeners = () => {
  if (!graph) return
  
  // Dnd 插件放置完成事件
  graph.on('drop', ({ node, x, y }: { e: MouseEvent, node: Node, x: number, y: number }) => {
    const nodeData = node.getData() as NodeData
    const config = nodeConfigMap[nodeData.type]
    
    if (!config) {
      node.remove()
      showMessage('error', '未知的节点类型')
      return
    }
    
    // 更新节点位置
    node.setPosition({ x: x - config.width / 2, y: y - config.height / 2 })
    
    // 选中新建的节点
    workflowStore.selectNode(node.id)
    
    // 更新选中样式
    graph!.getNodes().forEach(n => {
      n.attr('body/stroke', '#000000')
      n.attr('body/strokeWidth', 1)
    })
    node.attr('body/stroke', '#1890ff')
    node.attr('body/strokeWidth', 2)
    
    showMessage('success', `已添加 ${config.label}`)
  })
  
  // 节点点击选中
  graph.on('node:click', ({ node }) => {
    workflowStore.selectNode(node.id)

    // 将选中的节点切换到最上层
    node.toFront()
    const data = node.getData()
    if (data.isContainer) {
      node.children?.forEach(n => n.toFront())
    }

    // 更新选中样式
    graph!.getNodes().forEach(n => {
      n.attr('body/stroke', '#000000')
      n.attr('body/strokeWidth', 1)
    })
    node.attr('body/stroke', '#1890ff')
    node.attr('body/strokeWidth', 2)
  })

  // 节点开始拖拽时置顶
  graph.on('node:moving', ({ node }) => {
    node.toFront()
    const data = node.getData()
    if (data.isContainer) {
      node.children?.forEach(n => n.toFront())
    }
  })

  // 画布点击取消选中
  graph.on('blank:click', () => {
    workflowStore.selectNode(null)
    graph!.getNodes().forEach(n => {
      n.attr('body/stroke', '#000000')
      n.attr('body/strokeWidth', 1)
    })
    graph!.getEdges().forEach(e => {
      e.attr('line/stroke', '#000000')
      e.attr('line/strokeWidth', 2)
    })
  })
  
  // 边点击选中
  graph.on('edge:click', ({ edge }) => {
    workflowStore.selectEdge(edge.id)

    // 将选中的边切换到最上层
    edge.toFront()

    graph!.getEdges().forEach(e => {
      e.attr('line/stroke', '#000000')
      e.attr('line/strokeWidth', 2)
    })
    edge.attr('line/stroke', '#1890ff')
    edge.attr('line/strokeWidth', 3)
  })
  
  // 边连接完成
  graph.on('edge:connected', ({ edge }) => {
    // 设置边样式
    edge.attr('line/stroke', '#000000')
    edge.attr('line/strokeWidth', 2)
    edge.setRouter({
      name: 'manhattan', // 路由类型
      args: {
        padding: 30,        // 节点周围留白
        cornerRadius: 0,    // 直角圆角（0=直角）
        direction: "auto"
      },
    })
  })
  
  // 缩放变化
  graph.on('scale', ({ sx }) => {
    zoom.value = sx
    workflowStore.setZoom(sx)
  })

  graph.on('node:embedded', ({ currentParent }) => {
    // 只处理关系容器节点
    if (currentParent) {
      const containerData = currentParent.getData<NodeData>()
      if (!containerData?.isContainer) return

      // 隐藏所有子节点的连接柱
      ;(currentParent.getChildren() || []).forEach((childNode) => {
        const child = childNode as Node
        child.getPorts().forEach((port) => {
          if (port.id) {
            child.setPortProp(port.id, 'attrs/circle/opacity', 0)
          }
        })
      })

      // 重新排列子节点 + 调整容器高度
      resizeContainer(currentParent as Node)
    }
  })

  // 监听节点 parent 变化（移入/移出容器）
  // change:parent 事件参数: current=当前父节点ID, previous=之前的父节点ID
  graph.on('cell:change:parent', ({ cell, current, previous }) => {
    if (!cell.isNode()) return
    const node = cell as Node

    // 节点移出容器（previous 存在，current 为空）
    if (previous && !current) {
      // 恢复移出节点连接柱的显示
      node.getPorts().forEach((port) => {
        if (port.id) {
          node.setPortProp(port.id, 'attrs/circle/opacity', 1)
        }
      })

      // 重新排列剩余子节点 + 调整容器高度
      const previousParent = graph!.getCellById(previous) as Node
      resizeContainer(previousParent)
    }
  })

  // 添加键盘监听
  window.addEventListener('keydown', handleKeyDown)
}

/**
 * 调整容器：重新排列子节点 + 调整容器高度
 * 1. 从顶部紧密排列所有子节点
 * 2. 根据最下方子节点调整容器高度
 * 3. 无子节点时恢复默认高度
 * @param container 容器节点
 */
const resizeContainer = (container: Node) => {
  const containerData = container.getData<NodeData>()
  if (!containerData?.isContainer) return

  const containerBBox = container.getBBox()
  // 过滤出真正属于该容器的子节点（解决 change:parent 事件时 children 未更新的问题）
  const children = (container.getChildren() || []).filter(
    (child) => child.getParent()?.id === container.id
  )

  // 配置：与 Vue 组件 .node-list 布局一致
  const padding = 8
  const headHeight = 89

  if (children.length === 0) {
    // 没有子节点，恢复默认高度
    container.resize(containerBBox.width, nodeConfigMap[containerData.type].height)
  } else {
    // 计算 .node-list 区域的起始 Y 坐标
    const listStartY = containerBBox.y + headHeight + padding + 2

    // 垂直布局子节点
    let currentY = listStartY
    let bottomY = 0
    children.forEach((childNode) => {
      const child = childNode as Node
      const x = containerBBox.x + padding
      child.setPosition({ x, y: currentY })
      currentY += child.getBBox().height
      bottomY = Math.max(bottomY, child.getBBox().bottom)
    })

    // 根据最下方子节点调整容器高度
    const newHeight = Math.max(
      bottomY - containerBBox.y + padding,
      nodeConfigMap[containerData.type].height
    )
    container.resize(containerBBox.width, newHeight)
  }
}

/**
 * 键盘事件处理 - Delete 和 Backspace 删除选中节点或边
 */
const handleKeyDown = (e: KeyboardEvent) => {
  // 检查是否在输入框中
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }

  // 删除边
  if ((e.key === 'Delete' || e.key === 'Backspace') && workflowStore.selectedEdgeId) {
    e.preventDefault()
    const edgeId = workflowStore.selectedEdgeId
    const edge = graph!.getCellById(edgeId)

    if (edge && edge.isEdge()) {
      edge.remove()
      workflowStore.selectEdge(null)
      showMessage('success', '连线已删除')
    }
    return
  }

  // 删除节点
  if ((e.key === 'Delete' || e.key === 'Backspace') && workflowStore.selectedNodeId) {
    e.preventDefault()
    const nodeId = workflowStore.selectedNodeId
    const node = graph!.getCellById(nodeId)

    if (node && node.isNode()) {
      // 获取连接到此节点的边并删除
      const edges = graph!.getConnectedEdges(node)
      edges.forEach(edge => edge.remove())

      // 删除节点
      node.remove()

      // 清除选中状态
      workflowStore.selectNode(null)
      showMessage('success', '节点已删除')
    }
  }
}

/**
 * 放大
 */
const handleZoomIn = () => {
  if (!graph) return
  const newZoom = graph.zoom(0.1)
  zoom.value = typeof newZoom === 'number' ? newZoom : 1
}

/**
 * 缩小
 */
const handleZoomOut = () => {
  if (!graph) return
  const newZoom = graph.zoom(-0.1)
  zoom.value = typeof newZoom === 'number' ? newZoom : 1
}

/**
 * 重置缩放
 */
const handleZoomReset = () => {
  if (!graph) return
  graph.zoomTo(1)
  zoom.value = 1
}

/**
 * 切换网格显示
 */
const handleToggleGrid = () => {
  showGrid.value = !showGrid.value
  if (graph) {
    if (showGrid.value) {
      graph.showGrid()
    } else {
      graph.hideGrid()
    }
  }
}

/**
 * 适应画布
 */
const handleFitView = () => {
  if (!graph) return
  graph.centerContent()
  graph.zoomToFit({ padding: 20, maxScale: 1 })
}

/**
 * 清空画布
 */
const handleClear = () => {
  if (!graph) return
  
  graph.clearCells()
  workflowStore.selectNode(null)
  showMessage('success', '画布已清空')
}

// 生命周期
onMounted(() => {
  initGraph()
})

onUnmounted(() => {
  // 移除键盘监听
  window.removeEventListener('keydown', handleKeyDown)
  if (dnd) {
    dnd.dispose()
  }
  if (graph) {
    graph.dispose()
  }
})

// 暴露方法给父组件调用
defineExpose({
  startDrag,
})
</script>

<style scoped>
/* 画布容器 */
.x6-canvas-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 工具栏 */
.canvas-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 缩放显示文本 */
.zoom-text {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  font-size: 14px;
  color: #666666;
}

/* 画布 - X6 需要明确的尺寸 */
.x6-graph-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: #f5f5f5;
}
</style>
