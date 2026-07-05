import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { selectDraftCover } from '@/lib/db/persistence'
import type { Platform } from '@/types'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params
    const body = (await req.json()) as { platform: Platform; selectedCoverByPlatform?: Partial<Record<Platform, string>> }
    const draft = await selectDraftCover(id, imageId, body.platform, body.selectedCoverByPlatform)
    return NextResponse.json(draft)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
