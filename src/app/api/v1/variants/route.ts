import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { upsertPlatformVariant } from '@/lib/db/persistence'
import type { PlatformVariant } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PlatformVariant
    const variant = await upsertPlatformVariant(body)
    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
