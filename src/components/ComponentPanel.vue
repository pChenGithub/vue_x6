<template>
  <div class="component-panel">
    <!-- 搜索框 -->
    <div class="search-box">
      <a-input-search
        v-model:value="searchText"
        placeholder="搜索组件"
        allow-clear
      />
    </div>
    
    <!-- 组件分类折叠面板 -->
    <a-collapse v-model:activeKey="activeKeys" class="component-collapse">
      <!-- 输入组件 -->
      <a-collapse-panel key="input" header="输入组件">
        <template #extra>
          <span class="category-dot" style="background: #52c41a"></span>
        </template>
        <div class="component-list">
          <div
            v-for="item in filteredInputComponents"
            :key="item.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
          >
            <div class="component-icon" :style="{ background: getComponentColor(item.type) }">
              <component :is="getComponentIcon(item.type)" />
            </div>
            <span class="component-label">{{ item.label }}</span>
          </div>
        </div>
      </a-collapse-panel>
      
      <!-- 条件组件 -->
      <a-collapse-panel key="condition" header="条件组件">
        <template #extra>
          <span class="category-dot" style="background: #faad14"></span>
        </template>
        <div class="component-list">
          <div
            v-for="item in filteredConditionComponents"
            :key="item.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
          >
            <div class="component-icon" :style="{ background: getComponentColor(item.type) }">
              <component :is="getComponentIcon(item.type)" />
            </div>
            <span class="component-label">{{ item.label }}</span>
          </div>
        </div>
      </a-collapse-panel>
      
      <!-- 关系组件 -->
      <a-collapse-panel key="relation" header="关系组件">
        <template #extra>
          <span class="category-dot" style="background: #1890ff"></span>
        </template>
        <div class="component-list">
          <div
            v-for="item in filteredRelationComponents"
            :key="item.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
          >
            <div class="component-icon" :style="{ background: getComponentColor(item.type) }">
              <component :is="getComponentIcon(item.type)" />
            </div>
            <span class="component-label">{{ item.label }}</span>
          </div>
        </div>
      </a-collapse-panel>
      
      <!-- 执行组件 -->
      <a-collapse-panel key="action" header="执行组件">
        <template #extra>
          <span class="category-dot" style="background: #13c2c2"></span>
        </template>
        <div class="component-list">
          <div
            v-for="item in filteredActionComponents"
            :key="item.type"
            class="component-item"
            @click="handleClick($event, item)"
          >
            <div class="component-icon" :style="{ background: getComponentColor(item.type) }">
              <component :is="getComponentIcon(item.type)" />
            </div>
            <span class="component-label">{{ item.label }}</span>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import * as Icons from '@ant-design/icons-vue'
import { NodeType, NodeCategory, type PanelItem } from '@/types/workflow'
import { nodeConfigMap } from '@/config/nodeConfig'

/** 接收父组件传入的 startDrag 方法 */
const props = defineProps<{
  startDrag?: (event: DragEvent, item: PanelItem) => void
  startDragClick?: (event: MouseEvent, item: PanelItem) => void
}>()

// 搜索文本
const searchText = ref('')

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

// 当前展开的面板
const activeKeys = ref<string[]>(['input', 'condition', 'relation', 'action'])

/**
 * 所有组件配置列表
 */
const allComponents: PanelItem[] = [
  // 输入组件
  { type: NodeType.START, label: '开始', category: NodeCategory.INPUT },
  { type: NodeType.END, label: '结束', category: NodeCategory.INPUT },
  // 条件组件
  { type: NodeType.CONDITION_TIME, label: '时间条件', category: NodeCategory.CONDITION },
  { type: NodeType.CONDITION_EVENT, label: '事件条件', category: NodeCategory.CONDITION },
  { type: NodeType.CONDITION_ATTRIBUTE, label: '属性条件', category: NodeCategory.CONDITION },
  { type: NodeType.CONDITION_CALCULATE, label: '计算条件', category: NodeCategory.CONDITION },
  // 关系组件
  { type: NodeType.RELATION_OR, label: '或关系', category: NodeCategory.RELATION },
  { type: NodeType.RELATION_AND, label: '且关系', category: NodeCategory.RELATION },
  // 执行组件
  { type: NodeType.ACTION_LIGHT, label: '开灯', category: NodeCategory.ACTION }
]

/**
 * 根据分类过滤组件
 */
const filteredInputComponents = computed(() => {
  return allComponents.filter(
    c => c.category === NodeCategory.INPUT && 
    (!searchText.value || c.label.includes(searchText.value))
  )
})

const filteredConditionComponents = computed(() => {
  return allComponents.filter(
    c => c.category === NodeCategory.CONDITION && 
    (!searchText.value || c.label.includes(searchText.value))
  )
})

const filteredRelationComponents = computed(() => {
  return allComponents.filter(
    c => c.category === NodeCategory.RELATION && 
    (!searchText.value || c.label.includes(searchText.value))
  )
})

const filteredActionComponents = computed(() => {
  return allComponents.filter(
    c => c.category === NodeCategory.ACTION && 
    (!searchText.value || c.label.includes(searchText.value))
  )
})

/**
 * 获取组件颜色
 */
const getComponentColor = (type: NodeType): string => {
  return nodeConfigMap[type]?.color || '#999999'
}

/**
 * 获取组件图标组件（动态获取，避免类型定义不完整问题）
 */
const getComponentIcon = (type: NodeType) => {
  const iconName = iconNameMap[type]
  // 使用 as any 绕过 TypeScript 类型检查，动态获取图标组件
  const IconComponent = (Icons as Record<string, unknown>)[iconName]
  // 如果图标不存在，返回备用组件
  return IconComponent || (() => h('span', { style: { fontSize: '16px' } }, '?'))
}

/**
 * 开始拖拽（调用 X6Canvas 的 startDrag 方法）
 */
const handleDragStart = (event: DragEvent, item: PanelItem) => {
  // 调用 X6Canvas 的 startDrag 方法启动 Dnd 插件拖拽
  props.startDrag?.(event, item)
}
const handleClick = (event: MouseEvent, item: PanelItem) => {
    props.startDragClick?.(event, item)
}
</script>

<style scoped>
/* 组件面板容器 */
.component-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 搜索框 */
.search-box {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

/* 折叠面板 */
.component-collapse {
  flex: 1;
  overflow-y: auto;
  border-right: none !important;
  border-radius: 0;
}

/* 分类圆点 */
.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 组件列表 */
.component-list {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 组件项 */
.component-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.component-item:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.component-item:active {
  cursor: grabbing;
}

/* 组件图标 */
.component-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 16px;
}

/* 组件标签 */
.component-label {
  font-size: 14px;
  color: #333333;
}
</style>
