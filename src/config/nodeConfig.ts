import { NodeType, NodeCategory, NodeConfig } from '@/types/workflow'

/**
 * 节点配置映射表
 * 定义每种节点类型的详细配置信息
 */
export const nodeConfigMap: Record<NodeType, NodeConfig> = {
  /** 开始节点：流程入口，只能有出连接 */
  [NodeType.START]: {
    type: NodeType.START,
    label: '开始',
    category: NodeCategory.INPUT,
    width: 120,
    height: 60,
    color: '#52c41a',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.CONDITION_TIME, NodeType.CONDITION_EVENT, NodeType.CONDITION_ATTRIBUTE, NodeType.CONDITION_CALCULATE]
    }
  },
  /** 结束节点：流程出口，只能有入连接 */
  [NodeType.END]: {
    type: NodeType.END,
    label: '结束',
    category: NodeCategory.INPUT,
    width: 120,
    height: 60,
    color: '#ff4d4f',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxInEdges: 1,
      allowedSources: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    }
  },
  /** 时间条件组件 */
  [NodeType.CONDITION_TIME]: {
    type: NodeType.CONDITION_TIME,
    label: '时间条件',
    category: NodeCategory.CONDITION,
    width: 140,
    height: 50,
    color: '#faad14',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    }
  },
  /** 事件条件组件 */
  [NodeType.CONDITION_EVENT]: {
    type: NodeType.CONDITION_EVENT,
    label: '事件条件',
    category: NodeCategory.CONDITION,
    width: 140,
    height: 50,
    color: '#fa8c16',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    }
  },
  /** 属性条件组件 */
  [NodeType.CONDITION_ATTRIBUTE]: {
    type: NodeType.CONDITION_ATTRIBUTE,
    label: '属性条件',
    category: NodeCategory.CONDITION,
    width: 140,
    height: 50,
    color: '#d46b08',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    }
  },
  /** 计算条件组件 */
  [NodeType.CONDITION_CALCULATE]: {
    type: NodeType.CONDITION_CALCULATE,
    label: '计算条件',
    category: NodeCategory.CONDITION,
    width: 140,
    height: 50,
    color: '#d46b08',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    }
  },
  /** 或关系容器 - 多个条件或关系满足其一即可 */
  [NodeType.RELATION_OR]: {
    type: NodeType.RELATION_OR,
    label: '或关系',
    category: NodeCategory.RELATION,
    width: 200,
    height: 100,
    color: '#1890ff',
    isContainer: true,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    }
  },
  /** 且关系容器 - 所有条件或关系都满足 */
  [NodeType.RELATION_AND]: {
    type: NodeType.RELATION_AND,
    label: '且关系',
    category: NodeCategory.RELATION,
    width: 200,
    height: 100,
    color: '#722ed1',
    isContainer: true,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    }
  },
  /** 执行组件 - 开灯 */
  [NodeType.ACTION_LIGHT]: {
    type: NodeType.ACTION_LIGHT,
    label: '开灯',
    category: NodeCategory.ACTION,
    width: 120,
    height: 50,
    color: '#13c2c2',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.END]
    }
  }
}

/** 连接柱方向类型 */
export type PortGroup = 'top' | 'bottom' | 'left' | 'right'

/**
 * 连接柱 groups 配置（用于节点注册）
 */
export const portGroups: Record<PortGroup, {
  position: PortGroup
  attrs: { circle: { r: number, magnet: boolean, stroke: string, strokeWidth: number, fill: string } }
}> = {
  top: {
    position: 'top',
    attrs: {
      circle: {
        r: 5,
        magnet: true,
        stroke: '#000000',
        strokeWidth: 2,
        fill: '#ffffff'
      }
    }
  },
  bottom: {
    position: 'bottom',
    attrs: {
      circle: {
        r: 5,
        magnet: true,
        stroke: '#000000',
        strokeWidth: 2,
        fill: '#ffffff'
      }
    }
  },
  left: {
    position: 'left',
    attrs: {
      circle: {
        r: 5,
        magnet: true,
        stroke: '#000000',
        strokeWidth: 2,
        fill: '#ffffff'
      }
    }
  },
  right: {
    position: 'right',
    attrs: {
      circle: {
        r: 5,
        magnet: true,
        stroke: '#000000',
        strokeWidth: 2,
        fill: '#ffffff'
      }
    }
  }
}

/**
 * 连接柱 items 配置（用于节点实例化）
 */
export const portItems: { id: PortGroup, group: PortGroup }[] = [
  { id: 'top', group: 'top' },
  { id: 'bottom', group: 'bottom' },
  { id: 'left', group: 'left' },
  { id: 'right', group: 'right' }
]
