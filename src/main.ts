import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import Antd from 'ant-design-vue'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css'
import './styles/global.css'

// 创建 Pinia 实例
const pinia = createPinia()

// 创建应用实例
const app = createApp(App)

// 先安装 Pinia
app.use(pinia)

// 确保 Pinia 已激活
setActivePinia(pinia)

// 安装 Ant Design Vue
app.use(Antd)

// 挂载应用
app.mount('#app')
