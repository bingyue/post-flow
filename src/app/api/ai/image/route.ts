import { NextRequest, NextResponse } from 'next/server'

function isSeedreamApi(apiBase: string, model: string): boolean {
  return (
    apiBase.includes('volces.com') ||
    model.includes('seedream') ||
    model.includes('doubao-seed')
  )
}

/** Seedream 支持 2K/3K 或显式 WxH */
function mapSeedreamSize(size: string): string {
  const normalized = size?.trim() || '2K'
  if (/^\d+\s*[xX]\s*\d+$/.test(normalized)) {
    return normalized.replace(/\s*[xX]\s*/, 'x')
  }
  if (['1K', '2K', '3K', '4K'].includes(normalized.toUpperCase())) {
    return normalized.toUpperCase()
  }
  return '2K'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiBase, apiKey, model, prompt, size } = body as {
      apiBase: string
      apiKey: string
      model: string
      prompt: string
      size: string
    }

    if (!apiKey?.trim()) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 })
    }

    const base = apiBase.replace(/\/$/, '')
    const useSeedream = isSeedreamApi(apiBase, model)

    const requestBody = useSeedream
      ? {
          model,
          prompt,
          size: mapSeedreamSize(size),
          response_format: 'url' as const,
          watermark: false,
          output_format: 'png' as const,
        }
      : {
          model,
          prompt,
          n: 1,
          size: size || '1024x1024',
        }

    const res = await fetch(`${base}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || JSON.stringify(data.error) },
        { status: 502 }
      )
    }

    const first = data.data?.[0]
    if (first?.error) {
      return NextResponse.json({ error: first.error.message || 'Image generation failed' }, { status: 502 })
    }

    const url = first?.url
    if (!url) {
      return NextResponse.json({ error: 'No image URL in response' }, { status: 502 })
    }

    return NextResponse.json({ url })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
