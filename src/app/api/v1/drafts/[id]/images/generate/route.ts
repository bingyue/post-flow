import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { createDraftImage } from '@/lib/db/persistence'
import type { Platform } from '@/types'

function isSeedreamApi(apiBase: string, model: string): boolean {
  return apiBase.includes('volces.com') || model.includes('seedream') || model.includes('doubao-seed')
}

function mapSeedreamSize(size: string): string {
  const normalized = size?.trim() || '2K'
  if (/^\d+\s*[xX]\s*\d+$/.test(normalized)) return normalized.replace(/\s*[xX]\s*/, 'x')
  if (['1K', '2K', '3K', '4K'].includes(normalized.toUpperCase())) return normalized.toUpperCase()
  return '2K'
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
      prompt: string
      size: string
      platform: Platform
    }
    const dimensions = body.platform === 'xhs' ? { width: 1080, height: 1440 } : { width: 900, height: 383 }
    const image = await createDraftImage({
      draftId: id,
      url: await generateImageUrl(body),
      ...dimensions,
      role: 'cover',
      source: body.apiKey?.trim() ? 'ai' : 'mock',
      prompt: body.prompt,
      platform: body.platform,
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

async function generateImageUrl(params: {
  apiBase?: string
  apiKey?: string
  model?: string
  prompt: string
  size: string
}) {
  if (!params.apiKey?.trim() || !params.apiBase?.trim() || !params.model?.trim()) {
    return mockImageUrl(params.size)
  }

  try {
    const base = params.apiBase.replace(/\/$/, '')
    const useSeedream = isSeedreamApi(params.apiBase, params.model)
    const requestBody = useSeedream
      ? {
          model: params.model,
          prompt: params.prompt,
          size: mapSeedreamSize(params.size),
          response_format: 'url' as const,
          watermark: false,
          output_format: 'png' as const,
        }
      : {
          model: params.model,
          prompt: params.prompt,
          n: 1,
          size: params.size || '1024x1024',
        }

    const res = await fetch(`${base}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    const url = data.data?.[0]?.url
    if (!url) throw new Error('No image URL in response')
    return String(url)
  } catch {
    return mockImageUrl(params.size)
  }
}

function mockImageUrl(size: string): string {
  const isWide = size.includes('1792') || size.includes('900')
  return isWide
    ? 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&h=383&fit=crop'
    : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=533&fit=crop'
}
