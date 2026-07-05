import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { createPlatformAccount } from '@/lib/db/persistence'
import type { Platform, PlatformAccount } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { platform: Platform; account?: PlatformAccount }
    const account = await createPlatformAccount(body.platform, body.account)
    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
