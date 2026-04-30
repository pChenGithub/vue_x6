<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#1890ff'
      }
    }"
  >
    <div class="workflow-editor">
      <!-- 顶部工具栏 -->
      <header class="editor-header">
        <h1 class="editor-title">场景联动流程编排</h1>
        <div class="header-actions">
          <a-button @click="handleSave">
            <template #icon><SaveOutlined /></template>
            保存JSON
          </a-button>
          <a-button @click="handleLoad">
            <template #icon><FolderOpenOutlined /></template>
            加载JSON
          </a-button>
          <a-button @click="handlePreview">
            <template #icon><PlayCircleOutlined /></template>
            预览
          </a-button>
        </div>
      </header>
      
      <!-- 主体内容区域 -->
      <div class="editor-body">
        <!-- 左侧组件面板 -->
        <aside class="component-panel">
          <ComponentPanel :start-drag="x6CanvasRef?.startDrag" :start-drag-click="x6CanvasRef?.startDragClick" />
        </aside>
        
        <!-- 中间画布区域 -->
        <main class="canvas-area">
          <X6Canvas ref="x6CanvasRef" />
        </main>
        
        <!-- 右侧属性配置面板 -->
        <aside class="config-panel">
          <ConfigPanel />
        </aside>
      </div>
      
      <!-- 预览弹窗 -->
      <a-modal
        v-model:open="previewVisible"
        title="流程预览"
        width="800px"
        :footer="null"
      >
        <pre class="preview-content">{{ previewData }}</pre>
      </a-modal>
      
      <!-- JSON导入弹窗 -->
      <a-modal
        v-model:open="importVisible"
        title="导入JSON"
        @ok="handleImportConfirm"
        :confirmLoading="importLoading"
      >
        <a-textarea
          v-model:value="importJson"
          placeholder="请粘贴JSON数据"
          :rows="10"
        />
      </a-modal>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { message } from 'ant-design-vue'
import { 
  SaveOutlined, 
  FolderOpenOutlined, 
  PlayCircleOutlined 
} from '@ant-design/icons-vue'
import { useWorkflowStore } from '@/stores/workflowStore'
import { type PanelItem } from '@/types/workflow'
import ComponentPanel from '@/components/ComponentPanel.vue'
import X6Canvas from '@/components/X6Canvas.vue'
import ConfigPanel from '@/components/ConfigPanel.vue'

// Store实例
const workflowStore = useWorkflowStore()

// X6Canvas 组件引用
const x6CanvasRef = ref<ComponentPublicInstance & { 
    startDrag: (event: DragEvent, item: PanelItem) => void 
    startDragClick: (event: MouseEvent, item: PanelItem) => void } | null>(null)

// 预览相关
const previewVisible = ref(false)
const previewData = ref('')

/**
 * 保存JSON
 */
const handleSave = () => {
  const json = workflowStore.exportWorkflow()
  if (!json) {
    message.warning('画布为空，无法保存')
    return
  }
  
  // 创建下载链接
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${workflowStore.workflowName || 'workflow'}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  message.success('保存成功')
}

/**
 * 加载JSON
 */
const handleLoad = () => {
  importVisible.value = true
  importJson.value = ''
}

const importVisible = ref(false)
const importJson = ref('')
const importLoading = ref(false)

/**
 * 确认导入
 */
const handleImportConfirm = () => {
  if (!importJson.value.trim()) {
    message.warning('请输入JSON数据')
    return
  }
  
  importLoading.value = true
  try {
    const success = workflowStore.importWorkflow(importJson.value)
    if (success) {
      message.success('导入成功')
      importVisible.value = false
    } else {
      message.error('导入失败，请检查JSON格式')
    }
  } catch {
    message.error('JSON格式错误')
  } finally {
    importLoading.value = false
  }
}

/**
 * 预览流程
 */
const handlePreview = () => {
  const json = workflowStore.exportWorkflow()
  if (!json) {
    message.warning('画布为空，无法预览')
    return
  }
  
  previewData.value = json
  previewVisible.value = true
}
</script>

<style scoped>
/* 编辑器容器 */
.workflow-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f0f2f5;
}

/* 顶部工具栏 */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.editor-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 主体内容区域 */
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧组件面板 */
.component-panel {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
}

/* 中间画布区域 */
.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 右侧属性配置面板 */
.config-panel {
  width: 320px;
  background: #ffffff;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
}

/* 预览内容 */
.preview-content {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 500px;
  overflow-y: auto;
}
</style>
