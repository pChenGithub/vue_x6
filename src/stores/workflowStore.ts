import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Graph } from '@antv/x6'
import { EdgeData, NodeData } from '@/types/workflow'

/**
 * 流程编排Store
 * 管理画布数据、选中节点、图形实例等全局状态
 */
export const useWorkflowStore = defineStore('workflow', () => {
  // ==================== 状态定义 ====================
  
  /** 图形实例引用 */
  const graph = ref<Graph | null>(null)
  
  /** 当前选中的节点ID */
  const selectedNodeId = ref<string | null>(null)

  /** 当前选中的边ID */
  const selectedEdgeId = ref<string | null>(null)

  /** 当前选中的节点数据 */
  const selectedNodeData = ref<NodeData | null>(null)
  
  /** 流程名称 */
  const workflowName = ref<string>('未命名流程')
  
  /** 是否显示网格 */
  const showGrid = ref<boolean>(true)
  
  /** 当前缩放比例 */
  const zoomLevel = ref<number>(1)
  
  /** 流程节点数据列表 */
  const nodes = ref<NodeData[]>([])
  
  /** 流程边数据列表 */
  const edges = ref<EdgeData[]>([])

  // ==================== 计算属性 ====================
  
  /** 是否有选中的节点 */
  const hasSelectedNode = computed(() => selectedNodeId.value !== null)
  
  /** 选中节点的类型 */
  const selectedNodeType = computed(() => selectedNodeData.value?.type ?? null)

  // ==================== 方法定义 ====================
  
  /**
   * 设置图形实例
   */
  const setGraph = (instance: Graph) => {
    graph.value = instance
  }
  
  /**
   * 选择节点
   */
  const selectNode = (nodeId: string | null) => {
    selectedNodeId.value = nodeId
    selectedEdgeId.value = null // 清除边选中

    if (nodeId && graph.value) {
      const node = graph.value.getCellById(nodeId)
      if (node && node.isNode()) {
        selectedNodeData.value = node.getData() as NodeData
      }
    } else {
      selectedNodeData.value = null
    }
  }

  /**
   * 选择边
   */
  const selectEdge = (edgeId: string | null) => {
    selectedEdgeId.value = edgeId
    selectedNodeId.value = null // 清除节点选中
    selectedNodeData.value = null
  }
  
  /**
   * 更新节点数据
   */
  const updateNodeData = (nodeId: string, data: Partial<NodeData>) => {
    if (graph.value) {
      const node = graph.value.getCellById(nodeId)
      if (node && node.isNode()) {
        const currentData = node.getData() as NodeData
        const newData = { ...currentData, ...data }
        node.setData(newData)
        
        if (selectedNodeId.value === nodeId) {
          selectedNodeData.value = newData
        }
      }
    }
  }
  
  /**
   * 更新节点配置参数
   */
  const updateNodeConfig = (nodeId: string, config: Record<string, unknown>) => {
    if (graph.value) {
      const node = graph.value.getCellById(nodeId)
      if (node && node.isNode()) {
        const currentData = node.getData() as NodeData
        const newData = { 
          ...currentData, 
          config: { ...currentData.config, ...config } 
        }
        node.setData(newData)
        
        if (selectedNodeId.value === nodeId) {
          selectedNodeData.value = newData
        }
      }
    }
  }
  
  /**
   * 更新节点标签
   */
  const updateNodeLabel = (nodeId: string, label: string) => {
    if (graph.value) {
      const node = graph.value.getCellById(nodeId)
      if (node && node.isNode()) {
        node.setAttrByPath('text/text', label)
        updateNodeData(nodeId, { label })
      }
    }
  }
  
  /**
   * 切换网格显示
   */
  const toggleGrid = () => {
    showGrid.value = !showGrid.value
    if (graph.value) {
      if (showGrid.value) {
        graph.value.showGrid()
      } else {
        graph.value.hideGrid()
      }
    }
  }
  
  /**
   * 设置缩放级别
   */
  const setZoom = (zoom: number) => {
    zoomLevel.value = Math.max(0.1, Math.min(2, zoom))
  }
  
  /**
   * 导出流程数据为JSON
   */
  const exportWorkflow = (): string => {
    if (!graph.value) return ''
    
    const cells = graph.value.getCells()
    const nodeList: NodeData[] = []
    const edgeList: EdgeData[] = []
    
    cells.forEach(cell => {
      if (cell.isNode()) {
        const data = cell.getData() as NodeData
        nodeList.push({
          id: cell.id,
          type: data.type,
          label: data.label,
          config: data.config,
          isContainer: data.isContainer
        })
      } else if (cell.isEdge()) {
        edgeList.push({
          id: cell.id,
          source: cell.getSourceCellId() as string,
          target: cell.getTargetCellId() as string
        })
      }
    })
    
    return JSON.stringify({
      name: workflowName.value,
      nodes: nodeList,
      edges: edgeList
    }, null, 2)
  }
  
  /**
   * 从JSON导入流程数据
   */
  const importWorkflow = (jsonStr: string): boolean => {
    if (!graph.value) return false
    
    try {
      const data = JSON.parse(jsonStr)
      
      // 清空画布
      graph.value.clearCells()
      
      // 设置流程名称
      workflowName.value = data.name || '未命名流程'
      
      // 导入节点
      data.nodes?.forEach((nodeData: NodeData) => {
        const node = graph.value!.createNode({
          id: nodeData.id,
          x: 100,
          y: 100,
          data: nodeData
        })
        graph.value!.addNode(node)
      })
      
      // 导入边
      data.edges?.forEach((edgeData: EdgeData) => {
        const edge = graph.value!.createEdge({
          id: edgeData.id,
          source: edgeData.source,
          target: edgeData.target
        })
        graph.value!.addEdge(edge)
      })
      
      return true
    } catch (e) {
      console.error('导入流程失败:', e)
      return false
    }
  }
  
  /**
   * 清空画布
   */
  const clearCanvas = () => {
    if (graph.value) {
      graph.value.clearCells()
      selectNode(null)
      workflowName.value = '未命名流程'
    }
  }

  return {
    // 状态
    graph,
    selectedNodeId,
    selectedEdgeId,
    selectedNodeData,
    workflowName,
    showGrid,
    zoomLevel,
    nodes,
    edges,
    // 计算属性
    hasSelectedNode,
    selectedNodeType,
    // 方法
    setGraph,
    selectNode,
    selectEdge,
    updateNodeData,
    updateNodeConfig,
    updateNodeLabel,
    toggleGrid,
    setZoom,
    exportWorkflow,
    importWorkflow,
    clearCanvas
  }
})
