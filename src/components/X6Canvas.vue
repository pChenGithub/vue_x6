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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Graph, Node } from '@antv/x6'
import { Dnd } from '@antv/x6-plugin-dnd'
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
import { type PanelItem, type NodeData } from '@/types/workflow'

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
  const node = graph.createNode({
    width: config.width,
    height: config.height,
    shape: 'rect',
    label: item.label,
    attrs: {
      body: {
        fill: config.color,
        stroke: '#000000',
        strokeWidth: 1,
        rx: 8,
        ry: 8
      },
      label: {
        fill: '#ffffff',
        fontSize: 14,
        textAnchor: 'middle',
        dominantBaseline: 'middle'
      }
    },
    ports: {
      groups: portGroups,
      items: portItems
    },
    data: { type: item.type, label: item.label }
  })
  
  // 开始拖拽
  dnd.start(node, event)
}
// 
const startDragClick = (event: MouseEvent, item: PanelItem) => {
  if (!graph || !dnd) return
  
  const config = nodeConfigMap[item.type]
  if (!config) return
  
  // 创建用于拖拽预览的临时节点
  const node = graph.createNode({
    width: config.width,
    height: config.height,
    shape: 'rect',
    label: item.label,
    attrs: {
      body: {
        fill: config.color,
        stroke: '#000000',
        strokeWidth: 1,
        rx: 8,
        ry: 8
      },
      label: {
        fill: '#ffffff',
        fontSize: 14,
        textAnchor: 'middle',
        dominantBaseline: 'middle'
      }
    },
    ports: {
      groups: portGroups,
      items: portItems
    },
    data: { type: item.type, label: item.label }
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
            const data = node.getData<{ parent: boolean }>()
            if (true) {
              const targetBBox = node.getBBox()
              return bbox.isIntersectWithRect(targetBBox)
            }
            return false
          })
        },
      },
  })
  
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
  
  // 遍历所有节点配置，注册节点
  Object.values(nodeConfigMap).forEach(config => {
    // X6 2.x 使用 Graph.registerNode 注册节点
    const nodeDefinition = {
      width: config.width,
      height: config.height,
      // SVG markup 定义（只定义结构，不定义样式）
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'text', selector: 'label' }
      ],
      // 样式属性写在外部 attrs 对象中
      attrs: {
        body: {
          fill: config.color,
          stroke: '#ff0000',
          strokeWidth: 1,
          rx: 8,
          ry: 8
        },
        label: {
          fill: '#ffffff',
          fontSize: 14,
          textAnchor: 'middle',
          dominantBaseline: 'middle'
        }
      },
      // 连接柱配置
      ports: {
        groups: portGroups
      },
      // 节点数据
      data: {
        type: config.type,
        label: config.label,
        isContainer: config.isContainer
      }
    }
    
    // 注册节点
    Graph.registerNode(
      config.type,
      nodeDefinition as unknown as Record<string, unknown>,
      true
    )
  })
}

/**
 * 设置事件监听
 */
const setupEventListeners = () => {
  if (!graph) return
  
  // Dnd 插件放置完成事件
  graph.on('drop', ({ e, node, x, y }: { e: MouseEvent, node: Node, x: number, y: number }) => {
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
    
    // 更新选中样式
    graph!.getNodes().forEach(n => {
      n.attr('body/stroke', '#000000')
      n.attr('body/strokeWidth', 1)
    })
    node.attr('body/stroke', '#1890ff')
    node.attr('body/strokeWidth', 2)
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
    workflowStore.selectNode(null)
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
    edge.setRouter("orth")
  })
  
  // 缩放变化
  graph.on('scale', ({ sx }) => {
    zoom.value = sx
    workflowStore.setZoom(sx)
  })
  
  // 容器节点检测 - 拖入子节点
  graph.on('node:moved', ({ node, x, y }) => {
    checkAndHandleContainerDrop(node, x, y)
  })
}

/**
 * 检测并处理容器拖放
 */
const checkAndHandleContainerDrop = (node: Node, x: number, y: number) => {
  if (!graph) return
  
  // 获取容器节点
  const containerNodes = graph.getNodes().filter(n => {
    const data = n.getData() as NodeData
    return data?.isContainer && n.id !== node.id
  })
  
  // 遍历容器节点
  for (const container of containerNodes) {
    const containerData = container.getData() as NodeData
    if (!containerData?.isContainer) continue
    
    // 获取容器边界
    const bbox = container.getBBox()
    
    // 检查节点是否在容器内
    if (x > bbox.x && x < bbox.x + bbox.width &&
        y > bbox.y && y < bbox.y + bbox.height) {
      // 如果节点已在该容器中，无需处理
      const parent = node.getParent()
      if (parent?.id === container.id) return
      
      // 从原容器移除（如果有）
      if (node.getParent()) {
        node.setParent(null as unknown as Node)
      }
      
      // 添加到新容器
      node.setParent(container, {
        embed: true
      })
      
      // 垂直排列子节点
      const childNodes = container.getChildren()?.filter(c => c.isNode()) || []
      const containerConfig = nodeConfigMap[containerData.type]
      
      childNodes.forEach((child, index) => {
        if (!child.isNode()) return
        const childData = child.getData() as NodeData
        const config = nodeConfigMap[childData.type]
        const height = config?.height || 50
        
        child.setPosition({
          x: (containerConfig.width - (config?.width || 100)) / 2,
          y: 20 + index * (height + 10)
        })
      })
      
      showMessage('success', `已添加到 ${containerConfig.label}`)
      return
    }
  }
  
  // 如果不在任何容器内，从容器中移除
  const parent = node.getParent()
  if (parent) {
    const parentData = parent.getData() as NodeData
    if (parentData?.isContainer) {
      // 从容器移除
      node.setParent(null as unknown as Node)
      
      // 重新排列容器内的其他节点
      const children = parent.getChildren()?.filter(c => c.isNode() && c.id !== node.id) || []
      const parentConfig = nodeConfigMap[parentData.type]
      
      children.forEach((child, index) => {
        if (!child.isNode()) return
        const childData = child.getData() as NodeData
        const config = nodeConfigMap[childData.type]
        child.setPosition({
          x: (parentConfig.width - (config?.width || 100)) / 2,
          y: 20 + index * ((config?.height || 50) + 10)
        })
      })
    }
  }
}

/**
 * 查找指定位置的容器节点
 */
const findContainerAtPosition = (x: number, y: number): Node | null => {
  if (!graph) return null
  
  // 从后往前遍历（优先选择顶层容器）
  const nodes = graph.getNodes().reverse()
  
  for (const node of nodes) {
    const data = node.getData() as NodeData
    if (!data?.isContainer) continue
    
    const bbox = node.getBBox()
    if (x > bbox.x && x < bbox.x + bbox.width &&
        y > bbox.y && y < bbox.y + bbox.height) {
      return node
    }
  }
  
  return null
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
  startDragClick
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
