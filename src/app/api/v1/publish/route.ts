import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { createPublishJobs } from '@/lib/db/persistence'
import type { PublishJob } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      jobs: (Omit<PublishJob, 'id' | 'createdAt' | 'retryCount'> | PublishJob)[]
    }
    if (!Array.isArray(body.jobs) || body.jobs.length === 0) {
      return NextResponse.json({ error: '发布任务不能为空' }, { status: 400 })
    }
    const jobs = await createPublishJobs(body.jobs)
    return NextResponse.json(jobs, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
