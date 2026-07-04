import { NextRequest, NextResponse } from 'next/server'
import { getActionPrompt, getSystemPrompt } from '@/lib/ai/prompts'
import type { GenerateAction, Platform } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      apiBase,
      apiKey,
      model,
      action,
      topic,
      platform,
      currentDraft,
    } = body as {
      apiBase: string
      apiKey: string
      model: string
      action: GenerateAction
      topic: string
      platform: Platform
      currentDraft?: { title: string; body: string }
    }

    if (!apiKey?.trim()) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 })
    }

    const base = apiBase.replace(/\/$/, '')
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: getSystemPrompt(platform) },
          {
            role: 'user',
            content: getActionPrompt(action, topic, currentDraft),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'Empty response' }, { status: 502 })
    }

    const parsed = safeParseModelJson(content)
    return NextResponse.json({
      title: parsed.title ?? '',
      body: parsed.body ?? '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      imagePrompt: parsed.image_prompt ?? parsed.imagePrompt,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function safeParseModelJson(content: string): Record<string, unknown> {
  try {
    return JSON.parse(content)
  } catch {
    // 兼容模型返回 ```json ... ``` 包裹
    const fenced = content.match(/```json\s*([\s\S]*?)\s*```/i)
    if (fenced?.[1]) {
      return JSON.parse(fenced[1])
    }
    // 退化：截取首尾大括号尝试解析
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1))
    }
    throw new Error('Model response is not valid JSON')
  }
}
