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
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed} from 'vue'
import { NodeType, NodeCategory, type PanelItem } from '@/types/workflow'
import { getComponentColor, getComponentIcon } from '@/types/common';
import { nodeConfigMap } from '@/config/nodeConfig';

/** 接收父组件传入的 startDrag 方法 */
const props = defineProps<{
  startDrag?: (event: DragEvent, item: PanelItem) => void
  startDragClick?: (event: MouseEvent, item: PanelItem) => void
}>()

// 搜索文本
const searchText = ref('')

// 当前展开的面板
const activeKeys = ref<string[]>(['input', 'condition', 'relation', 'action'])

/**
 * 根据分类过滤组件
 */
const filteredInputComponents = computed(() => {
  return Object.values(nodeConfigMap).filter(
    c => c.category === NodeCategory.INPUT && 
    (!searchText.value || c.label.includes(searchText.value))
  )
})

const filteredConditionComponents = computed(() => {
  return Object.values(nodeConfigMap).filter(
    c => c.category === NodeCategory.CONDITION && 
    (!searchText.value || c.label.includes(searchText.value))
  )
})

const filteredRelationComponents = computed(() => {
  return Object.values(nodeConfigMap).filter(
    c => c.category === NodeCategory.RELATION && 
    (!searchText.value || c.label.includes(searchText.value))
  )
})

const filteredActionComponents = computed(() => {
  return Object.values(nodeConfigMap).filter(
    c => c.category === NodeCategory.ACTION && 
    (!searchText.value || c.label.includes(searchText.value))
  )
})

/**
 * 开始拖拽（调用 X6Canvas 的 startDrag 方法）
 */
const handleDragStart = (event: DragEvent, item: PanelItem) => {
  // 调用 X6Canvas 的 startDrag 方法启动 Dnd 插件拖拽
  console.log("控件被拖动");
  props.startDrag?.(event, item)
}
/*
const handleClick = (event: MouseEvent) => {
    //props.startDragClick?.(event, item)
    event.target?.dispatchEvent(new MouseEvent('dragstart', {
        bubbles: true,
        cancelable: true
      }))
}
*/
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
