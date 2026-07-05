import { NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { getPublishLogs } from '@/lib/db/persistence'

export async function GET() {
  try {
    return NextResponse.json(await getPublishLogs())
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
