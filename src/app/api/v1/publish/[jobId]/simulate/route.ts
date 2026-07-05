import { NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { simulatePublishJob } from '@/lib/db/persistence'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const job = await simulatePublishJob(jobId)
    return NextResponse.json(job)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

