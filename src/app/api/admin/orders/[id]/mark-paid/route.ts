import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { markAdminOrderPaid } from '@/lib/admin/data'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    return NextResponse.json(await markAdminOrderPaid(id))
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

