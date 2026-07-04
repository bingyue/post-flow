import type { AiConfig } from '@/types'
import type { GenerateAction, Platform } from '@/types'
import { hasLlmConfig } from './config'
import { getActionPrompt, getSystemPrompt } from './prompts'

export interface GenerateResult {
  title: string
  body: string
  tags: string[]
  imagePrompt?: string
  source: 'ai' | 'mock'
}

const MOCK_TITLES: Record<Platform, string[]> = {
  xhs: ['这样穿真的绝了✨', '夏日通勤5件单品', '博主私藏穿搭公式'],
  wechat_mp: ['深度解读：夏季通勤穿搭方法论', '从0到1搭建个人品牌内容体系'],
}

export async function generateContent(
  config: AiConfig,
  params: {
    action: GenerateAction
    topic: string
    platform: Platform
    currentDraft?: { title: string; body: string }
  }
): Promise<GenerateResult> {
  if (!hasLlmConfig(config)) {
    await delay(1500)
    return mockGenerate(params.topic, params.platform, params.action, params.currentDraft)
  }

  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiBase: config.llmApiBase,
        apiKey: config.llmApiKey,
        model: config.llmModel,
        action: params.action,
        topic: params.topic,
        platform: params.platform,
        currentDraft: params.currentDraft,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return { ...data, source: 'ai' as const }
  } catch {
    await delay(800)
    return mockGenerate(params.topic, params.platform, params.action, params.currentDraft)
  }
}

export async function generateImage(
  config: AiConfig,
  params: { prompt: string; size: string }
): Promise<{ url: string; source: 'ai' | 'mock' }> {
  const apiKey = config.imageApiKey
  if (!apiKey.trim()) {
    await delay(2000)
    return { url: mockImageUrl(params.size), source: 'mock' }
  }

  try {
    const res = await fetch('/api/ai/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiBase: config.imageApiBase || config.llmApiBase,
        apiKey,
        model: config.imageModel,
        prompt: params.prompt,
        size: params.size,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return { url: data.url, source: 'ai' }
  } catch {
    await delay(1500)
    return { url: mockImageUrl(params.size), source: 'mock' }
  }
}

function mockGenerate(
  topic: string,
  platform: Platform,
  action: GenerateAction,
  current?: { title: string; body: string }
): GenerateResult {
  const titles = MOCK_TITLES[platform]
  const title =
    action === 'retitle' && current
      ? titles[Math.floor(Math.random() * titles.length)]
      : topic.slice(0, platform === 'xhs' ? 18 : 40) || titles[0]

  let body = current?.body ?? ''
  if (action === 'full' || !body) {
    body =
      platform === 'xhs'
        ? `关于「${topic}」的分享 ✨\n\n1️⃣ 第一点：核心观点\n这里是 Mock 生成的示例正文，配置 DeepSeek API Key 后可获得真实内容。\n\n2️⃣ 第二点：实用建议\n建议前往设置页填入 DeepSeek（文本）与 Seedream（配图）Key。\n\n3️⃣ 第三点：总结\n希望对你有帮助～`
        : `## 引言\n\n本文探讨「${topic}」这一话题。\n\n## 核心观点\n\n这是 Mock 生成的公众号示例正文。在设置页配置 DeepSeek API Key 后，将调用真实大模型生成内容。\n\n## 总结\n\n感谢阅读，欢迎点赞关注。`
  } else if (action === 'shorten') {
    body = body.slice(0, Math.floor(body.length * 0.7))
  } else if (action === 'expand') {
    body += '\n\n【扩写内容】更多细节和案例补充…'
  }

  return {
    title,
    body,
    tags: platform === 'xhs' ? ['Mock示例', 'PostFlow', topic.slice(0, 6)] : [],
    imagePrompt: `Social media cover image about ${topic}, modern, clean`,
    source: 'mock',
  }
}

function mockImageUrl(size: string): string {
  const isWide = size.includes('1792') || size.includes('900')
  return isWide
    ? 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&h=383&fit=crop'
    : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=533&fit=crop'
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export { getSystemPrompt, getActionPrompt }
