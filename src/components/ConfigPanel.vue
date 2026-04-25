<template>
  <div class="config-panel">
    <div class="panel-header">
      <h3 class="panel-title">节点配置</h3>
    </div>
    
    <div class="panel-body">
      <!-- 无选中节点时显示空状态 -->
      <a-empty v-if="!hasSelectedNode" description="请选择画布中的节点">
        <template #image>
          <SettingOutlined style="font-size: 48px; color: #d9d9d9" />
        </template>
      </a-empty>
      
      <!-- 选中节点时显示配置表单 -->
      <div v-else class="config-form">
        <!-- 节点基本信息 -->
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          
          <a-form layout="vertical">
            <!-- 节点ID -->
            <a-form-item label="节点ID">
              <a-input :value="selectedNodeId" disabled />
            </a-form-item>
            
            <!-- 节点类型 -->
            <a-form-item label="节点类型">
              <a-input :value="nodeTypeName" disabled />
            </a-form-item>
            
            <!-- 节点名称 -->
            <a-form-item label="节点名称">
              <a-input
                :value="nodeLabel"
                @change="handleLabelChange"
                placeholder="请输入节点名称"
              />
            </a-form-item>
          </a-form>
        </div>
        
        <!-- 根据节点类型显示不同配置 -->
        <div class="form-section">
          <h4 class="section-title">参数配置</h4>
          
          <!-- 开始/结束节点 -->
          <template v-if="isInputNode">
            <a-alert
              message="输入节点"
              description="开始节点是流程的入口点，结束节点是流程的终点。"
              type="info"
              show-icon
            />
          </template>
          
          <!-- 时间条件配置 -->
          <template v-else-if="nodeType === NodeType.CONDITION_TIME">
            <a-form layout="vertical">
              <a-form-item label="触发时间">
                <a-date-picker
                  :value="nodeConfig.time"
                  @change="(val: dayjs.Dayjs) => handleConfigChange('time', val)"
                  show-time
                  style="width: 100%"
                />
              </a-form-item>
              <a-form-item label="重复执行">
                <a-select
                  :value="nodeConfig.repeat"
                  @change="(val: string) => handleConfigChange('repeat', val)"
                >
                  <a-select-option value="none">不重复</a-select-option>
                  <a-select-option value="daily">每天</a-select-option>
                  <a-select-option value="weekly">每周</a-select-option>
                  <a-select-option value="monthly">每月</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </template>
          
          <!-- 事件条件配置 -->
          <template v-else-if="nodeType === NodeType.CONDITION_EVENT">
            <a-form layout="vertical">
              <a-form-item label="事件类型">
                <a-select
                  :value="nodeConfig.eventType"
                  @change="(val: string) => handleConfigChange('eventType', val)"
                >
                  <a-select-option value="click">点击</a-select-option>
                  <a-select-option value="dblclick">双击</a-select-option>
                  <a-select-option value="change">值变化</a-select-option>
                  <a-select-option value="enter">进入</a-select-option>
                  <a-select-option value="leave">离开</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="目标对象">
                <a-input
                  :value="nodeConfig.target"
                  @change="(e: Event) => handleConfigChange('target', (e.target as HTMLInputElement).value)"
                  placeholder="请输入目标对象标识"
                />
              </a-form-item>
            </a-form>
          </template>
          
          <!-- 属性条件配置 -->
          <template v-else-if="nodeType === NodeType.CONDITION_ATTRIBUTE">
            <a-form layout="vertical">
              <a-form-item label="属性名">
                <a-input
                  :value="nodeConfig.attribute"
                  @change="(e: Event) => handleConfigChange('attribute', (e.target as HTMLInputElement).value)"
                  placeholder="请输入属性名"
                />
              </a-form-item>
              <a-form-item label="比较操作">
                <a-select
                  :value="nodeConfig.operator"
                  @change="(val: string) => handleConfigChange('operator', val)"
                >
                  <a-select-option value="eq">等于</a-select-option>
                  <a-select-option value="ne">不等于</a-select-option>
                  <a-select-option value="gt">大于</a-select-option>
                  <a-select-option value="lt">小于</a-select-option>
                  <a-select-option value="ge">大于等于</a-select-option>
                  <a-select-option value="le">小于等于</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="比较值">
                <a-input
                  :value="nodeConfig.value"
                  @change="(e: Event) => handleConfigChange('value', (e.target as HTMLInputElement).value)"
                  placeholder="请输入比较值"
                />
              </a-form-item>
            </a-form>
          </template>
          
          <!-- 计算条件配置 -->
          <template v-else-if="nodeType === NodeType.CONDITION_CALCULATE">
            <a-form layout="vertical">
              <a-form-item label="计算公式">
                <a-textarea
                  :value="nodeConfig.formula"
                  @change="(e: Event) => handleConfigChange('formula', (e.target as HTMLTextAreaElement).value)"
                  placeholder="请输入计算公式"
                  :rows="3"
                />
              </a-form-item>
              <a-form-item label="结果条件">
                <a-select
                  :value="nodeConfig.resultCondition"
                  @change="(val: string) => handleConfigChange('resultCondition', val)"
                >
                  <a-select-option value="true">结果为真</a-select-option>
                  <a-select-option value="false">结果为假</a-select-option>
                  <a-select-option value="greater">大于0</a-select-option>
                  <a-select-option value="less">小于0</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </template>
          
          <!-- 或关系/且关系配置 -->
          <template v-else-if="isRelationNode">
            <a-alert
              :message="nodeTypeName"
              :description="nodeType === NodeType.RELATION_OR ? '满足任一条件即执行后续流程' : '满足所有条件才执行后续流程'"
              type="info"
              show-icon
            />
            <div class="relation-info">
              <p>当前包含 <strong>{{ childCount }}</strong> 个子条件</p>
            </div>
          </template>
          
          <!-- 开灯执行配置 -->
          <template v-else-if="nodeType === NodeType.ACTION_LIGHT">
            <a-form layout="vertical">
              <a-form-item label="设备名称">
                <a-input
                  :value="nodeConfig.deviceName"
                  @change="(e: Event) => handleConfigChange('deviceName', (e.target as HTMLInputElement).value)"
                  placeholder="请输入设备名称"
                />
              </a-form-item>
              <a-form-item label="设备ID">
                <a-input
                  :value="nodeConfig.deviceId"
                  @change="(e: Event) => handleConfigChange('deviceId', (e.target as HTMLInputElement).value)"
                  placeholder="请输入设备ID"
                />
              </a-form-item>
              <a-form-item label="操作类型">
                <a-select
                  :value="nodeConfig.action"
                  @change="(val: string) => handleConfigChange('action', val)"
                >
                  <a-select-option value="turnOn">打开</a-select-option>
                  <a-select-option value="turnOff">关闭</a-select-option>
                  <a-select-option value="toggle">切换</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="亮度(%)">
                <a-slider
                  :value="nodeConfig.brightness || 100"
                  @change="(val: number) => handleConfigChange('brightness', val)"
                  :min="0"
                  :max="100"
                />
              </a-form-item>
            </a-form>
          </template>
        </div>
        
        <!-- 操作按钮 -->
        <div class="form-actions">
          <a-space>
            <a-button type="primary" @click="handleSaveConfig">
              保存配置
            </a-button>
            <a-button danger @click="handleDeleteNode">
              删除节点
            </a-button>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SettingOutlined } from '@ant-design/icons-vue'
import type dayjs from 'dayjs'
import { showMessage } from '@/utils/message'
import { useWorkflowStore } from '@/stores/workflowStore'
import { nodeConfigMap } from '@/config/nodeConfig'
import { NodeType, type NodeData } from '@/types/workflow'

// Store实例
const workflowStore = useWorkflowStore()

// 节点配置数据（本地副本）
const nodeConfig = ref<Record<string, unknown>>({})

// 计算属性
const hasSelectedNode = computed(() => workflowStore.hasSelectedNode)
const selectedNodeId = computed(() => workflowStore.selectedNodeId || '')
const selectedNodeData = computed(() => workflowStore.selectedNodeData)
const nodeType = computed(() => selectedNodeData.value?.type || null)
const nodeLabel = computed(() => selectedNodeData.value?.label || '')
const nodeTypeName = computed(() => {
  if (!nodeType.value) return ''
  return nodeConfigMap[nodeType.value]?.label || ''
})

// 是否为输入节点（开始/结束）
const isInputNode = computed(() => {
  return nodeType.value === NodeType.START || nodeType.value === NodeType.END
})

// 是否为关系节点
const isRelationNode = computed(() => {
  return nodeType.value === NodeType.RELATION_OR || nodeType.value === NodeType.RELATION_AND
})

// 获取子节点数量
const childCount = computed(() => {
  if (!workflowStore.graph || !workflowStore.selectedNodeId) return 0
  const node = workflowStore.graph.getCellById(workflowStore.selectedNodeId)
  if (!node || !node.isNode()) return 0
  
  const data = node.getData() as NodeData
  if (!data?.isContainer) return 0
  
  const children = node.getChildren()
  return children?.filter(c => c.isNode()).length || 0
})

// 监听选中节点变化，更新本地配置
watch(() => workflowStore.selectedNodeData, (newData) => {
  if (newData?.config) {
    nodeConfig.value = { ...newData.config }
  } else {
    nodeConfig.value = {}
  }
}, { immediate: true })

/**
 * 处理标签变更
 */
const handleLabelChange = (e: Event) => {
  const newLabel = (e.target as HTMLInputElement).value
  if (workflowStore.selectedNodeId) {
    workflowStore.updateNodeLabel(workflowStore.selectedNodeId, newLabel)
  }
}

/**
 * 处理配置变更
 */
const handleConfigChange = (key: string, value: unknown) => {
  nodeConfig.value[key] = value
}

/**
 * 保存配置
 */
const handleSaveConfig = () => {
  if (workflowStore.selectedNodeId) {
    workflowStore.updateNodeConfig(workflowStore.selectedNodeId, nodeConfig.value)
    showMessage('success', '配置已保存')
  }
}

/**
 * 删除节点
 */
const handleDeleteNode = () => {
  if (!workflowStore.graph || !workflowStore.selectedNodeId) return
  
  const node = workflowStore.graph.getCellById(workflowStore.selectedNodeId)
  if (!node) return
  
  // 如果是开始或结束节点，需要检查连接
  const data = node.getData() as NodeData
  if (data?.type === NodeType.START || data?.type === NodeType.END) {
    // 获取所有边
    const edges = workflowStore.graph.getEdges()
    const hasConnection = edges.some(edge => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      return sourceId === workflowStore.selectedNodeId || targetId === workflowStore.selectedNodeId
    })
    
    if (hasConnection) {
      showMessage('warning', '请先删除与该节点连接的边')
      return
    }
  }
  
  workflowStore.graph.removeCell(workflowStore.selectedNodeId)
  workflowStore.selectNode(null)
  showMessage('success', '节点已删除')
}
</script>

<style scoped>
/* 配置面板容器 */
.config-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 面板头部 */
.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

/* 面板内容 */
.panel-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 配置表单 */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 表单区块 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

/* 关系节点信息 */
.relation-info {
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-top: 12px;
}

.relation-info p {
  margin: 0;
  font-size: 14px;
  color: #666666;
}

.relation-info strong {
  color: #1890ff;
}

/* 操作按钮 */
.form-actions {
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: center;
}
</style>
