<template>
  <div class="node-component">
    <span class="node-label">执行</span>
    <component class="node-icon" :is="ComponentIcon" />
    <div class="node-title-group">
    <span class="node-title">{{ title }}</span>
    <span class="node-title">{{ desp }}</span>
    </div>
    <!--<a-date-picker placeholder="选择时间" />-->
</div>
</template>

<script lang="ts">
import { nodeConfigMap } from '@/config/nodeConfig';
import { getComponentColor, getComponentIcon } from '@/types/common';
import { NodeType } from '@/types/workflow';
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Action',
    inject: ['getNode'],
    data() {
        return {
            nodeType: NodeType.CONDITION_TIME,
            title: nodeConfigMap.condition_time.label,
            desp: "-"
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
.node-icon {
    color: red;
}

</style>