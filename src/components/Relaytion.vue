<template>
  <div class="node-component">
    <div class="node-head">
        <span class="node-label">运算</span>
        <component class="node-icon" :is="ComponentIcon" :style="{ background: ComponentColor }" />
        <span class="node-title">{{ title }}</span>
    </div>
    <div class="node-list"></div>
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
</style>