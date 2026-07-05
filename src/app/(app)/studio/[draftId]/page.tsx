'use client'

import { use, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StudioStepper } from '@/components/studio/StudioStepper'
import { DraftEditor } from '@/components/studio/DraftEditor'
import { AiConfigBanner } from '@/components/studio/AiConfigBanner'
import { Toast } from '@/components/ui/Dialog'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { loadAiConfig } from '@/lib/ai/config'
import type { ContentDraft, DraftVersion, GenerateAction, User } from '@/types'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function StudioEditPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = use(params)
  const router = useRouter()
  const { drafts, updateDraft, updateUser, addDraftVersion } = useDemoStore()
  const draft = drafts.find((d) => d.id === draftId)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (draft) {
      setTitle(draft.masterTitle)
      setBody(draft.masterBody)
      setTags(draft.masterTags)
    }
  }, [draft])

  const save = useCallback(() => {
    if (!draft) return
    updateDraft(draftId, { masterTitle: title, masterBody: body, masterTags: tags })
  }, [draft, draftId, title, body, tags, updateDraft])

  useEffect(() => {
    const t = setInterval(save, 30000)
    return () => clearInterval(t)
  }, [save])

  const runAction = async (action: GenerateAction) => {
    if (!draft) return
    setLoading(true)
    const config = loadAiConfig()
    const response = await fetch(`/api/v1/drafts/${draftId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiBase: config.llmApiBase,
        apiKey: config.llmApiKey,
        model: config.llmModel,
        action,
        topic: draft.topic,
        platform: draft.platformTargets[0] ?? 'xhs',
        currentDraft: { title, body },
      }),
    })

    if (!response.ok) {
      setLoading(false)
      setToast(response.status === 402 ? 'AI 额度不足' : 'AI 生成失败，请稍后重试')
      return
    }

    const data = (await response.json()) as {
      result: { title: string; body: string; tags: string[]; source: 'ai' | 'mock' }
      draft: ContentDraft
      version: DraftVersion
      user: User
    }
    setTitle(data.result.title)
    setBody(data.result.body)
    setTags(data.result.tags)
    addDraftVersion(draftId, data.version)
    updateDraft(draftId, data.draft)
    updateUser(data.user)
    setLoading(false)
    setToast(data.result.source === 'mock' ? 'Mock 生成（未配置 Key 或请求失败）' : 'AI 生成完成')
  }

  if (!draft) {
    return (
      <>
        <TopBar title="草稿不存在" />
        <div className="p-6">
          <Link href="/studio/new">
            <Button>新建创作</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="编辑草稿" breadcrumb={`Studio / ${draft.topic.slice(0, 20)}`} />
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <StudioStepper draftId={draftId} />
        <AiConfigBanner />

        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['rewrite', 'shorten', 'expand', 'retitle'] as const).map((a) => {
                const labels = { rewrite: '重写', shorten: '缩短', expand: '扩写', retitle: '换标题' } as const
                return (
                <Button key={a} variant="secondary" size="sm" disabled={loading} onClick={() => runAction(a)}>
                  <Sparkles className="h-3 w-3" />
                  {labels[a]}
                </Button>
              )})}
            </div>
            <DraftEditor
              title={title}
              body={body}
              tags={tags}
              onTitleChange={setTitle}
              onBodyChange={setBody}
              onTagsChange={setTags}
              showTags={draft.platformTargets.includes('xhs')}
            />
          </CardBody>
        </Card>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={save}>
            保存
          </Button>
          <Button
            onClick={() => {
              save()
              router.push(`/studio/${draftId}/images`)
            }}
          >
            下一步：配图 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
