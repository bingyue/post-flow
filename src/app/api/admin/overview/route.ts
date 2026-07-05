import { NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { getAdminOverview } from '@/lib/admin/data'

export async function GET() {
  try {
    return NextResponse.json(await getAdminOverview())
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

