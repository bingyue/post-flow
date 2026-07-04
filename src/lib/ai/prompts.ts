import type { GenerateAction, Platform } from '@/types'

export function getSystemPrompt(platform: Platform): string {
  if (platform === 'xhs') {
    return `你是小红书爆款图文创作助手。要求：
- 标题不超过20字，吸引眼球
- 正文口语化，适当使用emoji分段
- 提供3-8个话题标签（不带#号）
- 正文建议800字以内
- 输出JSON格式：{"title":"","body":"","tags":[]}`
  }
  return `你是微信公众号深度图文创作助手。要求：
- 标题不超过64字，专业有深度
- 正文800-2000字，含2-4个小标题（##格式）
- 结构清晰，段落分明
- 文末可加引导关注语
- 输出JSON格式：{"title":"","body":"","tags":[]}`
}

export function getActionPrompt(action: GenerateAction, topic: string, current?: { title: string; body: string }): string {
  switch (action) {
    case 'full':
      return `请根据以下选题创作一篇完整的社媒图文：\n\n选题：${topic}`
    case 'rewrite':
      return `请完全重写以下文稿，保持主题但换一种表达方式：\n\n标题：${current?.title}\n\n正文：${current?.body}`
    case 'shorten':
      return `请将以下文稿缩短至少20%，保留核心观点：\n\n标题：${current?.title}\n\n正文：${current?.body}`
    case 'expand':
      return `请扩写以下文稿，增加细节和案例：\n\n标题：${current?.title}\n\n正文：${current?.body}`
    case 'retitle':
      return `请为以下文稿生成5个新标题，选最好的一个作为title输出：\n\n原标题：${current?.title}\n\n正文：${current?.body}`
    default:
      return topic
  }
}
