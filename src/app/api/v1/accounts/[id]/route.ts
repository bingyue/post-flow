import { NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { deletePlatformAccount } from '@/lib/db/persistence'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deletePlatformAccount(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
