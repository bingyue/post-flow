'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Input, Textarea } from '@/components/ui/Input'
import { StudioStepper } from '@/components/studio/StudioStepper'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { adaptToPlatforms, diffText } from '@/lib/adapter'
import type { Platform, PlatformVariant } from '@/types'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StudioAdaptPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = use(params)
  const router = useRouter()
  const { drafts, variants, upsertVariant, updateVariant } = useDemoStore()
  const draft = drafts.find((d) => d.id === draftId)
  const draftVariants = useMemo(() => variants.filter((v) => v.draftId === draftId), [variants, draftId])

  const [activePlatform, setActivePlatform] = useState<Platform>('xhs')
  const [localVariants, setLocalVariants] = useState<PlatformVariant[]>([])

  useEffect(() => {
    if (!draft) return
    if (draftVariants.length >= draft.platformTargets.length) {
      setLocalVariants(draftVariants)
      if (!draft.platformTargets.includes(activePlatform)) {
        setActivePlatform(draft.platformTargets[0])
      }
      return
    }
    const adapted = adaptToPlatforms(draftId, draft, draft.platformTargets)
    adapted.forEach((v) => upsertVariant(v))
    setLocalVariants(adapted)
    if (!draft.platformTargets.includes(activePlatform)) {
      setActivePlatform(draft.platformTargets[0])
    }
  }, [draft, draftVariants, draftId, upsertVariant, activePlatform])

  if (!draft) return null

  const current = localVariants.find((v) => v.platform === activePlatform)

  const updateCurrent = (patch: Partial<PlatformVariant>) => {
    if (!current) return
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() }
    updateVariant(current.id, patch)
    setLocalVariants((vs) => vs.map((v) => (v.id === current.id ? updated : v)))
  }

  const masterDiff = current
    ? diffText(draft.masterBody, current.body)
    : { changed: false, summary: '' }

  return (
    <>
      <TopBar title="平台适配" breadcrumb="Studio / 适配" />
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <StudioStepper draftId={draftId} />

        <div className="flex gap-2">
          {draft.platformTargets.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium',
                activePlatform === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              )}
            >
              {p === 'xhs' ? '小红书' : '微信公众号'}
            </button>
          ))}
        </div>

        {current && (
          <>
            <div className="rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-600">
              与源稿对比：{masterDiff.summary}
            </div>
            <Card>
              <CardBody className="space-y-4">
                <div>
                  <Label>标题 ({current.title.length} 字)</Label>
                  <Input value={current.title} onChange={(e) => updateCurrent({ title: e.target.value })} />
                </div>
                <div>
                  <Label>正文</Label>
                  <Textarea
                    value={current.body}
                    onChange={(e) => updateCurrent({ body: e.target.value })}
                    rows={10}
                  />
                </div>
                {activePlatform === 'xhs' && (
                  <div>
                    <Label>标签（逗号分隔）</Label>
                    <Input
                      value={current.tags.join(', ')}
                      onChange={(e) =>
                        updateCurrent({
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        })
                      }
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeaderDiff title="变更高亮" master={draft.masterBody} adapted={current.body} />
            </Card>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={() => router.push(`/studio/${draftId}/preview`)}>
            下一步：预览 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

function CardHeaderDiff({
  title,
  master,
  adapted,
}: {
  title: string
  master: string
  adapted: string
}) {
  return (
    <div className="px-5 py-4 border-b border-slate-100">
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div className="rounded bg-red-50 p-3">
          <div className="text-red-600 font-medium mb-1">源稿</div>
          <p className="text-slate-600 line-clamp-4 whitespace-pre-wrap">{master}</p>
        </div>
        <div className="rounded bg-green-50 p-3">
          <div className="text-green-600 font-medium mb-1">适配版</div>
          <p className="text-slate-600 line-clamp-4 whitespace-pre-wrap">{adapted}</p>
        </div>
      </div>
    </div>
  )
}
