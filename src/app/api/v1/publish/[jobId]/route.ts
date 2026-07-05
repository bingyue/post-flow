import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { getPublishJob, updatePublishJob } from '@/lib/db/persistence'
import type { PublishJob } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const job = await getPublishJob(jobId)
    if (!job) return NextResponse.json({ error: 'Publish job not found' }, { status: 404 })
    return NextResponse.json(job)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const body = (await req.json()) as Partial<PublishJob>
    const job = await updatePublishJob(jobId, body)
    return NextResponse.json(job)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
