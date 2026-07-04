'use client'

import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { simulatePublish, useDemoStore } from '@/lib/store/DemoStoreContext'
import { formatDate, platformLabel, statusLabel } from '@/lib/utils'

export default function QueuePage() {
  const { publishJobs, updatePublishJob, updateDraft } = useDemoStore()

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
                      onClick={() => {
                        updatePublishJob(j.id, {
                          mode: 'immediate',
                          scheduledAt: undefined,
                          status: 'running',
                        })
                        updateDraft(j.draftId, { status: 'publishing' })
                        simulatePublish(j.id, j.platform, updatePublishJob, () => {
                          updateDraft(j.draftId, { status: 'published' })
                        })
                      }}
                    >
                      立即发布
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
