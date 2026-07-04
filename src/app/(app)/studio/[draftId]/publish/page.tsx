'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Input } from '@/components/ui/Input'
import { StudioStepper } from '@/components/studio/StudioStepper'
import { ComplianceReport } from '@/components/publish/ComplianceReport'
import { Dialog } from '@/components/ui/Dialog'
import { XhsNoteCard } from '@/components/platform/XhsNoteCard'
import { WechatArticlePreview } from '@/components/platform/WechatArticlePreview'
import { useDemoStore, simulatePublish } from '@/lib/store/DemoStoreContext'
import { scanCompliance } from '@/lib/compliance/scan'
import type { ComplianceResult, PublishJob, Platform } from '@/types'
import { Loader2 } from 'lucide-react'

export default function StudioPublishPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = use(params)
  const router = useRouter()
  const {
    drafts,
    variants,
    images,
    accounts,
    createPublishJobs,
    updatePublishJob,
    updateDraft,
    updateUser,
  } = useDemoStore()

  const draft = drafts.find((d) => d.id === draftId)
  const draftVariants = useMemo(
    () => variants.filter((v) => v.draftId === draftId),
    [variants, draftId]
  )

  const platformTargetsKey = draft?.platformTargets.join(',') ?? ''
  const accountsKey = accounts.map((a) => `${a.id}:${a.platform}:${a.status}`).join('|')

  const compliance = useMemo((): ComplianceResult | null => {
    if (!draft || draftVariants.length === 0) return null
    const results: ComplianceResult = { passed: true, issues: [] }
    draftVariants.forEach((v) => {
      const r = scanCompliance(v.title, v.body, v.tags, v.platform)
      if (!r.passed) results.passed = false
      results.issues.push(...r.issues)
    })
    return results
  }, [draft, draftVariants])

  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({})
  const [mode, setMode] = useState<'immediate' | 'scheduled'>('immediate')
  const [scheduledAt, setScheduledAt] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!draft) return
    setSelectedAccounts((prev) => {
      const next = { ...prev }
      draft.platformTargets.forEach((p) => {
        const selected = next[p]
        const stillValid =
          selected && accounts.some((a) => a.id === selected && a.platform === p && a.status === 'active')
        if (!stillValid) {
          const fallback = accounts.find((a) => a.platform === p && a.status === 'active')
          next[p] = fallback?.id ?? ''
        }
      })
      return next
    })
    // 仅随 draftId / 平台目标 / 账号状态变化时重置默认选中
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, platformTargetsKey, accountsKey])

  if (!draft) return null

  const missingAccountPlatforms = draft.platformTargets.filter((p) => !selectedAccounts[p])

  const scheduleError = getScheduleError(mode, scheduledAt)

  const hasVariants = draftVariants.length > 0
  const canPublish =
    !publishing &&
    hasVariants &&
    compliance !== null &&
    compliance.passed &&
    missingAccountPlatforms.length === 0 &&
    !scheduleError

  const handlePublish = () => {
    if (!canPublish) return
    setConfirmOpen(true)
  }

  const confirmPublish = () => {
    if (!canPublish) return
    setConfirmOpen(false)
    setPublishing(true)

    const jobs = draftVariants
      .filter((v) => selectedAccounts[v.platform])
      .map((v) => ({
        draftId,
        variantId: v.id,
        accountId: selectedAccounts[v.platform],
        platform: v.platform,
        draftTitle: v.title,
        mode,
        scheduledAt: mode === 'scheduled' ? scheduledAt : undefined,
        status: (mode === 'scheduled' ? 'queued' : 'running') as PublishJob['status'],
      }))

    if (jobs.length === 0) {
      setPublishing(false)
      return
    }

    const created = createPublishJobs(jobs)
    updateDraft(draftId, { status: mode === 'scheduled' ? 'ready' : 'publishing' })

    if (mode === 'immediate') {
      created.forEach((job) => {
        simulatePublish(job.id, job.platform, updatePublishJob, () => {
          updateDraft(draftId, { status: 'published' })
          updateUser({ firstPublishAt: new Date().toISOString() })
        })
      })
      setTimeout(() => {
        setPublishing(false)
        router.push('/logs')
      }, 2500)
    } else {
      setPublishing(false)
      router.push('/queue')
    }
  }

  const minDateTime = toLocalDateTime(new Date(Date.now() + 5 * 60 * 1000))
  const maxDateTime = toLocalDateTime(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  const getCoverUrl = (platform: Platform) => {
    const imageId = draft.selectedCoverByPlatform[platform]
    return imageId ? images.find((img) => img.id === imageId)?.url : undefined
  }

  return (
    <>
      <TopBar title="发布确认" breadcrumb="Studio / 发布" />
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <StudioStepper draftId={draftId} />

        {compliance && <ComplianceReport result={compliance} />}

        <Card>
          <CardBody className="space-y-4">
            {draft.platformTargets.map((p) => {
              const platformAccounts = accounts.filter((a) => a.platform === p)
              return (
                <div key={p}>
                  <Label>{p === 'xhs' ? '小红书' : '微信公众号'} 发布账号</Label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={selectedAccounts[p] ?? ''}
                    onChange={(e) =>
                      setSelectedAccounts({ ...selectedAccounts, [p]: e.target.value })
                    }
                  >
                    <option value="">请选择</option>
                    {platformAccounts.map((a) => (
                      <option key={a.id} value={a.id} disabled={a.status !== 'active'}>
                        {a.nickname} {a.status !== 'active' ? `(${a.status})` : ''}
                      </option>
                    ))}
                  </select>
                  {!selectedAccounts[p] && (
                    <p className="mt-1 text-xs text-amber-600">该平台暂无可用账号，请先去账号管理连接</p>
                  )}
                </div>
              )
            })}

            <div>
              <Label>发布模式</Label>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setMode('immediate')}
                  className={`rounded-lg px-4 py-2 text-sm ${mode === 'immediate' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
                >
                  即时发布
                </button>
                <button
                  onClick={() => setMode('scheduled')}
                  className={`rounded-lg px-4 py-2 text-sm ${mode === 'scheduled' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
                >
                  定时发布
                </button>
              </div>
            </div>

            {mode === 'scheduled' && (
              <div>
                <Label>发布时间</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={minDateTime}
                  max={maxDateTime}
                />
                {scheduleError && <p className="mt-1 text-xs text-red-600">{scheduleError}</p>}
              </div>
            )}

            {!hasVariants && (
              <p className="text-sm text-red-600">请先完成平台适配，至少生成一个平台版本后再发布。</p>
            )}
          </CardBody>
        </Card>

        <Button
          className="w-full"
          disabled={!canPublish}
          onClick={handlePublish}
        >
          {publishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> 发布中…
            </>
          ) : (
            '确认发布'
          )}
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="发布前确认"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button onClick={confirmPublish}>确认发布</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">请确认以下内容无误：</p>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {draftVariants.map((variant) =>
            variant.platform === 'xhs' ? (
              <div key={variant.id} className="space-y-2">
                <div className="text-xs text-slate-500">小红书预览</div>
                <XhsNoteCard title={variant.title} body={variant.body} tags={variant.tags} className="mx-auto" />
              </div>
            ) : (
              <div key={variant.id} className="space-y-2">
                <div className="text-xs text-slate-500">公众号预览</div>
                <WechatArticlePreview title={variant.title} body={variant.body} coverUrl={getCoverUrl('wechat_mp')} />
              </div>
            )
          )}
        </div>
      </Dialog>
    </>
  )
}

function toLocalDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

function getScheduleError(mode: 'immediate' | 'scheduled', scheduledAt: string): string {
  if (mode !== 'scheduled') return ''
  if (!scheduledAt) return '请选择定时发布时间'
  const target = new Date(scheduledAt)
  if (Number.isNaN(target.getTime())) return '发布时间格式无效'
  const now = Date.now()
  const min = now + 5 * 60 * 1000
  const max = now + 30 * 24 * 60 * 60 * 1000
  if (target.getTime() < min) return '定时发布时间需晚于当前时间 5 分钟'
  if (target.getTime() > max) return '定时发布时间需在 30 天内'
  return ''
}
