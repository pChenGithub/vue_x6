import Action from '@/components/Action.vue'
import ConditionTime from '@/components/ConditionTime.vue'
import Input from '@/components/Input.vue'
import Relaytion from '@/components/Relaytion.vue'
import { NodeType, NodeCategory, NodeConfig } from '@/types/workflow'

/**
 * 节点配置映射表
 * 定义每种节点类型的详细配置信息
 */
const INPUT_WIDTH = 120
const INPUT_HEIGHT = 40

const CONDITION_WIDTH = 350
const CONDITION_HEIGHT = 110

const RELATION_WIDTH = 348
const RELATION_HEIGHT = 216 // 默认高度

const ACTION_WIDTH = 350
const ACTION_HEIGHT = 110

export const nodeConfigMap: Record<NodeType, NodeConfig> = {
  /** 开始节点：流程入口，只能有出连接 */
  [NodeType.START]: {
    type: NodeType.START,
    label: '开始',
    category: NodeCategory.INPUT,
    width: INPUT_WIDTH,
    height: INPUT_HEIGHT,
    color: '#52c41a',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.CONDITION_TIME, NodeType.CONDITION_EVENT, NodeType.CONDITION_ATTRIBUTE, NodeType.CONDITION_CALCULATE]
    },
    component: Input,
  },
  /** 结束节点：流程出口，只能有入连接 */
  [NodeType.END]: {
    type: NodeType.END,
    label: '结束',
    category: NodeCategory.INPUT,
    width: INPUT_WIDTH,
    height: INPUT_HEIGHT,
    color: '#ff4d4f',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxInEdges: 1,
      allowedSources: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    },
    component: Input,
  },
  /** 时间条件组件 */
  [NodeType.CONDITION_TIME]: {
    type: NodeType.CONDITION_TIME,
    label: '时间条件',
    category: NodeCategory.CONDITION,
    width: CONDITION_WIDTH,
    height: CONDITION_HEIGHT,
    color: '#b1f0c6',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    },
    component: ConditionTime,
  },
  /** 事件条件组件 */
  [NodeType.CONDITION_EVENT]: {
    type: NodeType.CONDITION_EVENT,
    label: '事件条件',
    category: NodeCategory.CONDITION,
    width: CONDITION_WIDTH,
    height: CONDITION_HEIGHT,
    color: '#fa8c16',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    },
    component: ConditionTime,
  },
  /** 属性条件组件 */
  [NodeType.CONDITION_ATTRIBUTE]: {
    type: NodeType.CONDITION_ATTRIBUTE,
    label: '属性条件',
    category: NodeCategory.CONDITION,
    width: CONDITION_WIDTH,
    height: CONDITION_HEIGHT,
    color: '#d46b08',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    },
    component: ConditionTime,
  },
  /** 计算条件组件 */
  [NodeType.CONDITION_CALCULATE]: {
    type: NodeType.CONDITION_CALCULATE,
    label: '计算条件',
    category: NodeCategory.CONDITION,
    width: CONDITION_WIDTH,
    height: CONDITION_HEIGHT,
    color: '#d46b08',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    },
    component: ConditionTime,
  },
  /** 或关系容器 - 多个条件或关系满足其一即可 */
  [NodeType.RELATION_OR]: {
    type: NodeType.RELATION_OR,
    label: '或关系',
    category: NodeCategory.RELATION,
    width: RELATION_WIDTH,
    height: RELATION_HEIGHT,
    color: '#1890ff',
    isContainer: true,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    },
    component: Relaytion,
  },
  /** 且关系容器 - 所有条件或关系都满足 */
  [NodeType.RELATION_AND]: {
    type: NodeType.RELATION_AND,
    label: '且关系',
    category: NodeCategory.RELATION,
    width: RELATION_WIDTH,
    height: RELATION_HEIGHT,
    color: '#722ed1',
    isContainer: true,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.ACTION_LIGHT]
    },
    component: Relaytion,
  },
  /** 执行组件 - 开灯 */
  [NodeType.ACTION_LIGHT]: {
    type: NodeType.ACTION_LIGHT,
    label: '开灯',
    category: NodeCategory.ACTION,
    width: ACTION_WIDTH,
    height: ACTION_HEIGHT,
    color: '#13c2c2',
    isContainer: false,
    isDraggable: true,
    ports: {
      maxOutEdges: 1,
      allowedTargets: [NodeType.RELATION_OR, NodeType.RELATION_AND, NodeType.END]
    },
    component: Action,
  }
}

/** 连接柱方向类型 */
export type PortGroup = 'top' | 'bottom' | 'left' | 'right'
/**
 * 连接柱 groups 配置（用于节点注册）
 */
const portAttrs = {
  circle: {r: 5, magnet: true, stroke: 'blue', strokeWidth: 1, fill: '#ffffff',
    opacity: 1,
  }
}
export const portGroups: Record<PortGroup, {
  position: PortGroup
  attrs: { circle: { r: number, magnet: boolean, stroke: string, strokeWidth: number, fill: string } }
}> = {
  top: {position: 'top', attrs: portAttrs},
  bottom: {position: 'bottom', attrs: portAttrs},
  left: {position: 'left', attrs: portAttrs},
  right: {position: 'right', attrs: portAttrs}
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
