import { NextRequest, NextResponse } from 'next/server'
import { getActionPrompt, getSystemPrompt } from '@/lib/ai/prompts'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { consumeUserAiQuota, createDraftVersion, updateContentDraft } from '@/lib/db/persistence'
import type { GenerateAction, Platform } from '@/types'

type GenerateResult = {
  title: string
  body: string
  tags: string[]
  imagePrompt?: string
  source: 'ai' | 'mock'
}

const MOCK_TITLES: Record<Platform, string[]> = {
  xhs: ['这样穿真的绝了', '夏日通勤5件单品', '博主私藏穿搭公式'],
  wechat_mp: ['深度解读：夏季通勤穿搭方法论', '从0到1搭建个人品牌内容体系'],
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      apiBase?: string
      apiKey?: string
      model?: string
      action: GenerateAction
      topic: string
      platform: Platform
      currentDraft?: { title: string; body: string }
    }

    const cost = body.action === 'full' ? 1 : 0.5
    const updatedUser = await consumeUserAiQuota(cost)
    if (!updatedUser) {
      return NextResponse.json({ error: 'AI 额度不足' }, { status: 402 })
    }

    const result = await generateContentWithFallback(body)
    const [version, draft] = await Promise.all([
      createDraftVersion(id, {
        title: result.title,
        body: result.body,
        tags: result.tags,
        source: body.action === 'full' ? 'ai_full' : 'ai_rewrite',
      }),
      updateContentDraft(id, {
        masterTitle: result.title,
        masterBody: result.body,
        masterTags: result.tags,
        imagePrompt: result.imagePrompt,
      }),
    ])

    return NextResponse.json({ result, draft, version, user: updatedUser })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

async function generateContentWithFallback(params: {
  apiBase?: string
  apiKey?: string
  model?: string
  action: GenerateAction
  topic: string
  platform: Platform
  currentDraft?: { title: string; body: string }
}): Promise<GenerateResult> {
  if (!params.apiKey?.trim() || !params.apiBase?.trim() || !params.model?.trim()) {
    return mockGenerate(params.topic, params.platform, params.action, params.currentDraft)
  }

  try {
    const base = params.apiBase.replace(/\/$/, '')
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        messages: [
          { role: 'system', content: getSystemPrompt(params.platform) },
          {
            role: 'user',
            content: getActionPrompt(params.action, params.topic, params.currentDraft),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })

    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty model response')
    const parsed = safeParseModelJson(content)
    return {
      title: String(parsed.title ?? ''),
      body: String(parsed.body ?? ''),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
      imagePrompt: typeof parsed.image_prompt === 'string' ? parsed.image_prompt : (parsed.imagePrompt as string | undefined),
      source: 'ai',
    }
  } catch {
    return mockGenerate(params.topic, params.platform, params.action, params.currentDraft)
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
        ? `关于「${topic}」的分享\n\n1. 核心观点\n这里是服务端 Mock 生成的示例正文，配置 DeepSeek API Key 后可获得真实内容。\n\n2. 实用建议\n把重点拆成更容易收藏的清单。\n\n3. 总结\n希望对你有帮助。`
        : `## 引言\n\n本文探讨「${topic}」这一话题。\n\n## 核心观点\n\n这是服务端 Mock 生成的公众号示例正文。在设置页配置 DeepSeek API Key 后，将调用真实大模型生成内容。\n\n## 总结\n\n感谢阅读，欢迎点赞关注。`
  } else if (action === 'shorten') {
    body = body.slice(0, Math.floor(body.length * 0.7))
  } else if (action === 'expand') {
    body += '\n\n【扩写内容】补充更多案例、步骤和可执行建议。'
  }

  return {
    title,
    body,
    tags: platform === 'xhs' ? ['Mock示例', 'PostFlow', topic.slice(0, 6)] : [],
    imagePrompt: `Social media cover image about ${topic}, modern, clean`,
    source: 'mock',
  }
}

function safeParseModelJson(content: string): Record<string, unknown> {
  try {
    return JSON.parse(content)
  } catch {
    const fenced = content.match(/```json\s*([\s\S]*?)\s*```/i)
    if (fenced?.[1]) return JSON.parse(fenced[1])
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(content.slice(start, end + 1))
    throw new Error('Model response is not valid JSON')
  }
}

