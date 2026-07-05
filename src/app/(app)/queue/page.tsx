'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { formatDate, platformLabel, statusLabel } from '@/lib/utils'
import type { PublishJob } from '@/types'

export default function QueuePage() {
  const { publishJobs, updatePublishJob, updateDraft } = useDemoStore()
  const [runningJobId, setRunningJobId] = useState<string | null>(null)

  const scheduled = publishJobs.filter(
    (j) => j.mode === 'scheduled' && (j.status === 'queued' || j.status === 'running')
  )

  return (
    <>
      <TopBar title="定时队列" />
      <div className="p-6">
        <Card>
          <CardBody className="space-y-4">
            {scheduled.length === 0 ? (
              <p className="text-center text-slate-500 py-8">暂无定时发布任务</p>
            ) : (
              scheduled.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-100 p-4"
                >
                  <div>
                    <div className="font-medium">{j.draftTitle}</div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Badge color={j.platform === 'xhs' ? 'xhs' : 'wechat'}>
                        {platformLabel(j.platform)}
                      </Badge>
                      <span>{j.scheduledAt && formatDate(j.scheduledAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge color="warning">{statusLabel(j.status)}</Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updatePublishJob(j.id, { status: 'cancelled' })}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      disabled={runningJobId === j.id}
                      onClick={async () => {
                        setRunningJobId(j.id)
                        updatePublishJob(j.id, {
                          mode: 'immediate',
                          scheduledAt: undefined,
                          status: 'running',
                        })
                        updateDraft(j.draftId, { status: 'publishing' })
                        const response = await fetch(`/api/v1/publish/${j.id}/simulate`, { method: 'POST' })
                        if (response.ok) {
                          const job = (await response.json()) as PublishJob
                          updatePublishJob(job.id, job)
                          updateDraft(j.draftId, { status: 'published' })
                        }
                        setRunningJobId(null)
                      }}
                    >
                      {runningJobId === j.id ? '发布中…' : '立即发布'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
