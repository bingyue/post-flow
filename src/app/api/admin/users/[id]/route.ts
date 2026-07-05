import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { getAdminUserDetail, updateAdminUser } from '@/lib/admin/data'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    return NextResponse.json(await getAdminUserDetail(id))
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const patch = {
      plan: typeof body.plan === 'string' ? body.plan : undefined,
      aiQuotaLimit: Number.isFinite(Number(body.aiQuotaLimit)) ? Number(body.aiQuotaLimit) : undefined,
      aiQuotaUsed: Number.isFinite(Number(body.aiQuotaUsed)) ? Number(body.aiQuotaUsed) : undefined,
      isAdmin: typeof body.isAdmin === 'boolean' ? body.isAdmin : undefined,
    }
    return NextResponse.json(await updateAdminUser(id, patch))
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

