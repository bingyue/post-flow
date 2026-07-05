'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Textarea, Input } from '@/components/ui/Input'
import { AiConfigBanner } from '@/components/studio/AiConfigBanner'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import type { ContentDraft, DraftVersion, Platform, User } from '@/types'
import { cn } from '@/lib/utils'
import { Link2, Sparkles, Wand2 } from 'lucide-react'
import { loadAiConfig } from '@/lib/ai/config'

export default function StudioNewPage() {
  const router = useRouter()
  const { createDraft, updateDraft, updateUser, addDraftVersion } = useDemoStore()
  const [platforms, setPlatforms] = useState<Platform[]>(['xhs'])
  const [topic, setTopic] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter((x) => x !== p) : prev) : [...prev, p]
    )
  }

  const handleCreate = async () => {
    if (topic.length < 10) return
    setError('')
    setLoading(true)
    const primary = platforms[0]

    const createdResponse = await fetch('/api/v1/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        platformTargets: platforms,
        referenceUrl: referenceUrl || undefined,
      }),
    })

    if (!createdResponse.ok) {
      setLoading(false)
      setError('草稿创建失败，请稍后重试')
      return
    }

    const draft = (await createdResponse.json()) as ContentDraft
    createDraft(draft)

    const config = loadAiConfig()
    const generateResponse = await fetch(`/api/v1/drafts/${draft.id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiBase: config.llmApiBase,
        apiKey: config.llmApiKey,
        model: config.llmModel,
        action: 'full',
        topic,
        platform: primary,
      }),
    })

    if (!generateResponse.ok) {
      setLoading(false)
      setError(generateResponse.status === 402 ? 'AI 额度已用完' : 'AI 生成失败，已为你保留空白草稿')
      router.push(`/studio/${draft.id}`)
      return
    }

    const data = (await generateResponse.json()) as {
      draft: ContentDraft
      version: DraftVersion
      user: User
    }
    updateDraft(draft.id, data.draft)
    addDraftVersion(draft.id, data.version)
    updateUser(data.user)
    setLoading(false)
    router.push(`/studio/${draft.id}`)
  }

  const handleBlank = async () => {
    setError('')
    setLoading(true)
    const response = await fetch('/api/v1/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        platformTargets: platforms,
        referenceUrl: referenceUrl || undefined,
      }),
    })
    setLoading(false)
    if (!response.ok) {
      setError('草稿创建失败，请稍后重试')
      return
    }
    const draft = (await response.json()) as ContentDraft
    createDraft(draft)
    router.push(`/studio/${draft.id}`)
  }

  return (
    <>
      <TopBar title="新建创作" breadcrumb="Studio" />
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <AiConfigBanner />

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="relative p-8">
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-500/30 blur-3xl" />
              <div className="absolute bottom-0 left-8 h-36 w-36 rounded-full bg-blue-500/25 blur-3xl" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <Wand2 className="h-6 w-6 text-rose-200" />
                </div>
                <h2 className="mt-6 font-display text-3xl font-bold tracking-tight">
                  从一个选题开始，生成可发布的多平台图文
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  输入选题、选择平台，PostFlow 会自动生成标题、正文、标签，并保留后续图片与发布流程。
                </p>
                <div className="mt-8 grid gap-3 text-sm">
                  {['平台语气适配', '草稿自动保存', 'AI 额度原子扣减'].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        <Card>
          <CardBody className="space-y-6">
            <div>
              <Label>目标平台</Label>
              <div className="mt-2 flex gap-3">
                {(['xhs', 'wechat_mp'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-200',
                      platforms.includes(p)
                        ? p === 'xhs'
                          ? 'border-[#FF2442]/30 bg-[#FF2442]/10 text-[#FF2442]'
                          : 'border-[#07C160]/30 bg-[#07C160]/10 text-[#058f48]'
                        : 'border-rose-100 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-600'
                    )}
                  >
                    {p === 'xhs' ? '小红书' : '微信公众号'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>选题 / 关键词（≥10 字）</Label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：夏季通勤穿搭，5 件单品搞定一周 office look"
                rows={3}
              />
              <p className="mt-1 text-xs text-slate-400">{topic.length} 字</p>
            </div>

            <div>
              <Label>参考链接（可选）</Label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={handleCreate}
                disabled={topic.length < 10 || loading}
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'AI 生成中…' : 'AI 生成并创建'}
              </Button>
              <Button variant="secondary" onClick={handleBlank} disabled={!topic}>
                空白草稿
              </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardBody>
        </Card>
        </section>
      </div>
    </>
  )
}
