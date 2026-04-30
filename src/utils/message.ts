/**
 * 消息提示工具函数
 * 提供统一的 ant-design-vue message 调用方式
 */
import { message } from 'ant-design-vue'

/** 消息类型 */
export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading'

/** 默认消息持续时间（毫秒） */
const DEFAULT_DURATION = 2

/**
 * 显示消息提示
 * @param type 消息类型
 * @param content 消息内容
 * @param duration 持续时间（秒），默认 2 秒
 */
export const showMessage = (
  type: MessageType,
  content: string,
  duration: number = DEFAULT_DURATION
): void => {
  // duration 需要转换为秒，message API 使用秒为单位
  const durationInSeconds = duration / 1000

  switch (type) {
    case 'success':
      message.success(content, durationInSeconds)
      break
    case 'error':
      message.error(content, durationInSeconds)
      break
    case 'warning':
      message.warning(content, durationInSeconds)
      break
    case 'info':
      message.info(content, durationInSeconds)
      break
    case 'loading':
      message.loading(content, durationInSeconds)
      break
    default:
      message.info(content, durationInSeconds)
  }
}
