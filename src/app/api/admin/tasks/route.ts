import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { listAdminTasks } from '@/lib/admin/data'

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') ?? undefined
    return NextResponse.json(await listAdminTasks(status))
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

