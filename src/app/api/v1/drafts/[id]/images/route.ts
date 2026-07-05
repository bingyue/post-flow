import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { createDraftImage, getDraftImages } from '@/lib/db/persistence'
import type { DraftImage } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const images = await getDraftImages(id)
    return NextResponse.json(images)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as Omit<DraftImage, 'id' | 'createdAt'>
    const image = await createDraftImage({ ...body, draftId: id })
    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
