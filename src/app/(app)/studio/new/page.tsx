'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Textarea, Input } from '@/components/ui/Input'
import { AiConfigBanner } from '@/components/studio/AiConfigBanner'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import type { Platform } from '@/types'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { loadAiConfig } from '@/lib/ai/config'
import { generateContent } from '@/lib/ai/client'

export default function StudioNewPage() {
  const router = useRouter()
  const { createDraft, consumeAiQuota, addDraftVersion } = useDemoStore()
  const [platforms, setPlatforms] = useState<Platform[]>(['xhs'])
  const [topic, setTopic] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter((x) => x !== p) : prev) : [...prev, p]
    )
  }

  const handleCreate = async () => {
    if (topic.length < 10) return
    if (!consumeAiQuota(1)) {
      alert('AI 额度已用完')
      return
    }
    setLoading(true)
    const primary = platforms[0]
    const result = await generateContent(loadAiConfig(), {
      action: 'full',
      topic,
      platform: primary,
    })
    const draft = createDraft({
      topic,
      platformTargets: platforms,
      masterTitle: result.title,
      masterBody: result.body,
      masterTags: result.tags,
      referenceUrl: referenceUrl || undefined,
      imagePrompt: result.imagePrompt,
    })
    addDraftVersion(draft.id, {
      title: result.title,
      body: result.body,
      tags: result.tags,
      source: result.source === 'ai' ? 'ai_full' : 'manual',
    })
    setLoading(false)
    router.push(`/studio/${draft.id}`)
  }

  const handleBlank = () => {
    const draft = createDraft({
      topic,
      platformTargets: platforms,
      referenceUrl: referenceUrl || undefined,
    })
    router.push(`/studio/${draft.id}`)
  }

  return (
    <>
      <TopBar title="新建创作" breadcrumb="Studio" />
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <AiConfigBanner />

        <Card>
          <CardBody className="space-y-5">
            <div>
              <Label>目标平台</Label>
              <div className="mt-2 flex gap-3">
                {(['xhs', 'wechat_mp'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      'rounded-lg border-2 px-4 py-2 text-sm font-medium',
                      platforms.includes(p)
                        ? p === 'xhs'
                          ? 'border-[#FF2442] bg-[#FF2442]/5 text-[#FF2442]'
                          : 'border-[#07C160] bg-[#07C160]/5 text-[#07C160]'
                        : 'border-slate-200 text-slate-500'
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
              <Input
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://"
              />
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
          </CardBody>
        </Card>
      </div>
    </>
  )
}
