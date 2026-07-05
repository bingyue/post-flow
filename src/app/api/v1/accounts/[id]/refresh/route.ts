import { NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { refreshPlatformAccount } from '@/lib/db/persistence'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const account = await refreshPlatformAccount(id)
    return NextResponse.json(account)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
