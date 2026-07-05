import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { createDraftImage } from '@/lib/db/persistence'
import type { Platform } from '@/types'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      url: string
      platform: Platform
      width?: number
      height?: number
    }

    if (!body.url?.startsWith('data:image/')) {
      return NextResponse.json({ error: '仅支持图片 Data URL 上传' }, { status: 400 })
    }

    if (estimateDataUrlBytes(body.url) > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: '文件不能超过 5MB' }, { status: 413 })
    }

    const dimensions =
      body.platform === 'xhs'
        ? { width: body.width ?? 1080, height: body.height ?? 1440 }
        : { width: body.width ?? 900, height: body.height ?? 383 }

    const image = await createDraftImage({
      draftId: id,
      url: body.url,
      ...dimensions,
      role: 'cover',
      source: 'upload',
      platform: body.platform,
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

function estimateDataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.ceil((base64.length * 3) / 4)
}
