/**
 * 节点类型枚举
 */
export enum NodeType {
  /** 开始节点 - 流程入口，只能有出连接 */
  START = 'start',
  /** 结束节点 - 流程出口，只能有入连接 */
  END = 'end',
  /** 条件组件 - 时间触发 */
  CONDITION_TIME = 'condition_time',
  /** 条件组件 - 事件触发 */
  CONDITION_EVENT = 'condition_event',
  /** 条件组件 - 属性触发 */
  CONDITION_ATTRIBUTE = 'condition_attribute',
  /** 条件组件 - 计算属性 */
  CONDITION_CALCULATE = 'condition_calculate',
  /** 关系组件 - 或关系（多个条件或关系可执行） */
  RELATION_OR = 'relation_or',
  /** 关系组件 - 且关系（多个条件且关系可执行） */
  RELATION_AND = 'relation_and',
  /** 执行组件 - 开灯 */
  ACTION_LIGHT = 'action_light'
}

/** 节点分类枚举 */
export enum NodeCategory {
  /** 输入组件 */
  INPUT = 'input',
  /** 条件组件 */
  CONDITION = 'condition',
  /** 关系组件 */
  RELATION = 'relation',
  /** 执行组件 */
  ACTION = 'action'
}

/** 节点配置接口 */
export interface NodeConfig {
  /** 节点类型 */
  type: NodeType
  /** 节点标题 */
  label: string
  /** 节点分类 */
  category: NodeCategory
  /** 节点宽度 */
  width: number
  /** 节点高度 */
  height: number
  /** 节点颜色 */
  color: string
  /** 是否为容器节点 */
  isContainer: boolean
  /** 是否可作为拖拽源 */
  isDraggable: boolean
  /** 连接约束 */
  ports?: {
    /** 是否只能有一个出连接 */
    maxOutEdges?: number
    /** 是否只能有一个入连接 */
    maxInEdges?: number
    /** 允许的连接来源类型 */
    allowedSources?: NodeType[]
    /** 允许的连接目标类型 */
    allowedTargets?: NodeType[]
  }
}

/** 连接柱配置接口 */
export interface PortConfig {
  /** 连接柱ID */
  id: string
  /** 连接柱位置 */
  group: 'top' | 'bottom' | 'left' | 'right'
}

/** 节点数据接口（存储在节点上的数据） */
export interface NodeData {
  /** 节点ID */
  id?: string
  /** 节点类型 */
  type: NodeType
  /** 节点标题 */
  label: string
  /** 节点配置参数 */
  config?: Record<string, unknown>
  /** 是否为容器 */
  isContainer: boolean
}

/** 边数据接口 */
export interface EdgeData {
  /** 边ID */
  id: string
  /** 源节点ID */
  source: string
  /** 目标节点ID */
  target: string
}

/** 流程图数据接口 */
export interface WorkflowData {
  /** 流程名称 */
  name: string
  /** 节点列表 */
  nodes: NodeData[]
  /** 边列表 */
  edges: EdgeData[]
}

/** 组件面板项接口 */
export interface PanelItem {
  /** 组件类型 */
  type: NodeType
  /** 组件名称 */
  label: string
  /** 组件图标 */
  icon?: string
  /** 组件分类 */
  category: NodeCategory
}
