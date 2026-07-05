import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { listAdminUsers } from '@/lib/admin/data'

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q') ?? undefined
    return NextResponse.json(await listAdminUsers(query))
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

