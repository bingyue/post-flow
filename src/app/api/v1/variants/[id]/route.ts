import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { updatePlatformVariant } from '@/lib/db/persistence'
import type { PlatformVariant } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as Partial<PlatformVariant>
    const variant = await updatePlatformVariant(id, body)
    return NextResponse.json(variant)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
