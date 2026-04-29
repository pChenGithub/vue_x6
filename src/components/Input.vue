<template>
  <div class="node-component">
    <component class="node-icon" :is="ComponentIcon" :style="{ background: ComponentColor }" />
    <span class="node-title">{{ title }}</span>
  </div>
</template>

<script lang="ts">
import { nodeConfigMap } from '@/config/nodeConfig';
import { getComponentColor, getComponentIcon } from '@/types/common';
import { NodeType } from '@/types/workflow';
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Input',
    inject: ['getNode'],
    data() {
        return {
            nodeType: NodeType.START,
            title: nodeConfigMap.start.label,
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
    },
})
</script>

<style scoped>
.node-icon {
    width: 40px;
    height: 40px;
    position: absolute;
    inset-inline-start: 0px;
    inset-block-start: 0px;
}
</style>