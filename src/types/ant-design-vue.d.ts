declare module 'ant-design-vue' {
  import type { App } from 'vue'

  const Antd: {
    install: (app: App) => void
  }

  export default Antd

  // message 组件类型
  interface MessageInstance {
    success(content: string, duration?: number): void
    error(content: string, duration?: number): void
    warning(content: string, duration?: number): void
    info(content: string, duration?: number): void
    loading(content: string, duration?: number): void
  }

  // 导出 message
  export const message: MessageInstance

  // 导出其他常用组件
  export const ConfigProvider: Record<string, unknown>
  export const Form: Record<string, unknown>
  export const Table: Record<string, unknown>
  export const Modal: Record<string, unknown>
  export const Input: Record<string, unknown>
  export const Select: Record<string, unknown>
  export const Switch: Record<string, unknown>
  export const InputNumber: Record<string, unknown>
  export const DatePicker: Record<string, unknown>
  export const TimePicker: Record<string, unknown>
  export const Button: Record<string, unknown>
  export const Collapse: Record<string, unknown>
  export const CollapsePanel: Record<string, unknown>
  export const Menu: Record<string, unknown>
  export const Dropdown: Record<string, unknown>
  export const Tabs: Record<string, unknown>
  export const TabPane: Record<string, unknown>
  export const Tag: Record<string, unknown>
  export const Space: Record<string, unknown>
  export const Card: Record<string, unknown>
  export const Divider: Record<string, unknown>
  export const Tooltip: Record<string, unknown>
  export const Popconfirm: Record<string, unknown>
  export const Upload: Record<string, unknown>
  export const ColorPicker: Record<string, unknown>
}

declare module '@ant-design/icons-vue' {
  import type { Component } from 'vue'

  // Outlined 图标
  export const SaveOutlined: Component
  export const FolderOpenOutlined: Component
  export const PlayCircleOutlined: Component
  export const SettingOutlined: Component
  export const PlusOutlined: Component
  export const MinusOutlined: Component
  export const AimOutlined: Component
  export const BorderOutlined: Component
  export const FullscreenExitOutlined: Component
  export const DeleteOutlined: Component

  // Filled 图标
  export const PlayCircleFilled: Component
  export const StopFilled: Component
  export const ClockCircleFilled: Component
  export const ThunderboltFilled: Component
  export const AppstoreFilled: Component
  export const CalculatorFilled: Component
  export const BulbFilled: Component
  export const PlusSquareFilled: Component

  // 其他图标
  export const BranchesOutlined: Component
}
