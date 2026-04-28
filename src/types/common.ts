import { NodeType } from "./workflow";
import { h } from 'vue'
import * as Icons from '@ant-design/icons-vue'
import { nodeConfigMap } from "@/config/nodeConfig";

// 图标名称映射表（用于动态获取图标组件）
const iconNameMap: Record<NodeType, string> = {
  [NodeType.START]: 'PlayCircleFilled',
  [NodeType.END]: 'StopFilled',
  [NodeType.CONDITION_TIME]: 'ClockCircleFilled',
  [NodeType.CONDITION_EVENT]: 'ThunderboltFilled',
  [NodeType.CONDITION_ATTRIBUTE]: 'AppstoreFilled',
  [NodeType.CONDITION_CALCULATE]: 'CalculatorFilled',
  [NodeType.RELATION_OR]: 'BranchesOutlined',
  [NodeType.RELATION_AND]: 'PlusSquareFilled',
  [NodeType.ACTION_LIGHT]: 'BulbFilled'
}

/**
 * 获取组件图标组件（动态获取，避免类型定义不完整问题）
 */
export const getComponentIcon = (type: NodeType) => {
  const iconName = iconNameMap[type]
  // 使用 as any 绕过 TypeScript 类型检查，动态获取图标组件
  const IconComponent = (Icons as Record<string, unknown>)[iconName]
  // 如果图标不存在，返回备用组件
  return IconComponent || (() => h('span', { style: { fontSize: '16px' } }, '?'))
}

/**
 * 获取组件颜色
 */
export const getComponentColor = (type: NodeType): string => {
  return nodeConfigMap[type]?.color || '#999999'
}