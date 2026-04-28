<template>
  <div class="node-component">
    <div class="node-content">
        <div class="node-head">
            <span class="node-label">运算</span>
            <component class="node-icon" :is="ComponentIcon" :style="{ background: ComponentColor }" />
            <span class="node-title">{{ title }}</span>
        </div>
        <div class="node-list"></div>
    </div>
  </div>
</template>

<script lang="ts">
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
        init(data: { type: NodeType; label: string }) {
            this.nodeType = data.type
            this.title = data.label
        }
    },
    mounted() {
        const node = (this as any).getNode()
        console.log(node.getData().label)
        const data = node.getData()
        this.init(data)
        // 监听data修改
        node.on('change:data', ({ current }: { current: { type: NodeType; label: string } }) => {
            console.log(current)
            this.init(current)
        })
    },
})
</script>

<style scoped>
.node-content {
  width: 100%;
  height: 100%;
  padding: 0px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.node-head {
    width: 100%;
    height: 89px;
    display: flex;
    align-items: center;
    justify-content: left;
    border-bottom: #cfcfcf 1px solid;
}

.node-icon {
  width: 38px;
  height: 38px;
  color: #ffffff;
  background-color: #65d6bf;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.node-title {
  height: 38px;
  font-size: 14px;
  color: #000000a6;
  font-weight: 500;
  border: gray 1px solid;
  border-left: 0px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  align-content: center;
  padding: 8px;
}
</style>