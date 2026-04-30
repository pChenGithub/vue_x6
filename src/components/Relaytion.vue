<template>
  <div class="node-component">
    <div class="node-head">
        <span class="node-label">运算</span>
        <component class="node-icon" :is="ComponentIcon" :style="{ background: ComponentColor }" />
        <span class="node-title">{{ title }}</span>
    </div>
    <div class="node-list">
      <div
        v-for="(child, index) in childNodes"
        :key="child.id"
        class="node-list-item"
      >
        <span class="node-list-index">{{ index + 1 }}</span>
        <span class="node-list-name">{{ child.label }}</span>
      </div>
      <div v-if="childNodes.length === 0" class="node-list-empty">
        拖拽条件组件到此处
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Node } from '@antv/x6'
import { nodeConfigMap } from '@/config/nodeConfig';
import { getComponentColor, getComponentIcon } from '@/types/common';
import { NodeType } from '@/types/workflow';
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Relaytion',
    inject: ['getNode'],
    data() {
        return {
            nodeType: NodeType.RELATION_OR,
            title: nodeConfigMap.relation_or.label,
            childNodes: [] as { id: string; label: string }[],
        }
    },
    computed: {
        ComponentIcon() {
            return getComponentIcon(this.nodeType)
        },
        ComponentColor() {
            return getComponentColor(this.nodeType)
        }
    },
    methods: {
        /** 初始化节点数据 */
        init(data: { type: NodeType; label: string }) {
            this.nodeType = data.type
            this.title = data.label
        },
        /** 更新子节点列表显示 */
        updateChildNodes() {
            const node = (this as any).getNode() as Node | undefined
            if (node) {
                const children = node.getChildren() || []
                this.childNodes = children
                    .filter((child): child is Node => child.isNode())
                    .map((child) => {
                        const childData = child.getData<NodeData>()
                        return {
                            id: child.id,
                            label: childData?.label || '未知'
                        }
                    })
            }
        }
    },
    mounted() {
        const node = (this as any).getNode() as Node | undefined
        if (!node) return

        // 初始化数据
        const data = node.getData<NodeData>()
        this.init(data)

        // 初始化子节点列表
        this.updateChildNodes()

        // 监听节点数据变化
        node.on('change:data', ({ current }: { current: NodeData }) => {
            this.init(current)
        })

        // 监听子节点嵌入
        node.on('node:embedded', () => {
            this.updateChildNodes()
        })

        // 监听子节点移除
        node.on('node:unembedded', () => {
            this.updateChildNodes()
        })
    },
})

// 类型定义
interface NodeData {
    type: NodeType
    label: string
    isContainer?: boolean
    config?: Record<string, unknown>
}
</script>

<style scoped>
.node-component {
  align-items: flex-start;
}

.node-head {
    width: 100%;
    height: 89px;
    display: flex;
    align-items: center;
    justify-content: left;
    border-bottom: #cfcfcf 1px solid;
    flex-shrink: 0;
}

.node-icon {
  width: 38px;
  height: 38px;
}

.node-title {
  height: 38px;
  border: #cfcfcf 1px solid;
  border-left: 0px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  align-content: center;
  padding: 8px;
}

.node-list {
  flex: 1;
  overflow-y: auto;
  min-height: 100px;
}

.node-list-item {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 4px;
}

.node-list-index {
  width: 20px;
  height: 20px;
  background: #1890ff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 8px;
  flex-shrink: 0;
}

.node-list-name {
  font-size: 13px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-list-empty {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}
</style>
