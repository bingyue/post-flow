import { NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { getQueueJobs } from '@/lib/db/persistence'

export async function GET() {
  try {
    return NextResponse.json(await getQueueJobs())
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
