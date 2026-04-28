<template>
  <div class="node-component">
    <div class="node-content">
      <span class="node-label">条件</span>
      <component class="node-icon" :is="ComponentIcon" :style="{ background: ComponentColor }" />
      <div class="node-title-group">
        <span class="node-title">{{ title }}</span>
        <span class="node-title">{{ desp }}</span>
      </div>
      <!--<a-date-picker placeholder="选择时间" />-->
    </div>
  </div>
</template>

<script lang="ts">
import { nodeConfigMap } from '@/config/nodeConfig';
import { getComponentColor, getComponentIcon } from '@/types/common';
import { NodeType } from '@/types/workflow';
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'ConditionTime',
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
/*
import { nodeConfigMap } from '@/config/nodeConfig';
import { getComponentIcon } from '@/types/common';
import { NodeType } from '@/types/workflow';
import { onMounted, ref, inject } from 'vue';

const nodeType = ref(NodeType.CONDITION_TIME);
const title = ref(nodeConfigMap.condition_time.label)
const desp = ref('...')

//const inject = ["getGraph", "getNode"]
//const { getNode } = useInject(inject)
//const getGraph = inject('getGraph')
const getNode = inject('getNode')
const getGraph = inject('getGraph')

onMounted(() => {
    const node = getGraph()
    node.on('change:data', ({ current }) => {
        nodeType.value = current.type
        title.value = current.label
        desp.value = '加了 '+current.label
    })
})
*/
</script>

<style scoped>
.node-title-group {
    width: 180px;
    height: 60px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  border: gray 1px solid;
  border-left: 0px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  padding: 10px;
}
.node-title-group:focus {
    border: red 1px solid;
}

.node-title {
  font-size: 14px;
  color: #000000a6;
  font-weight: 500;
}
</style>