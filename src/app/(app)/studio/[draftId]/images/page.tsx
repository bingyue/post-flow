'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Textarea } from '@/components/ui/Input'
import { StudioStepper } from '@/components/studio/StudioStepper'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { loadAiConfig } from '@/lib/ai/config'
import type { ContentDraft, DraftImage, Platform } from '@/types'
import { ArrowRight, Upload, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StudioImagesPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = use(params)
  const router = useRouter()
  const { drafts, images, addImage, updateDraft } = useDemoStore()
  const draft = drafts.find((d) => d.id === draftId)
  const draftImages = images.filter((i) => i.draftId === draftId)

  const [prompt, setPrompt] = useState(draft?.imagePrompt ?? '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPrompt(draft?.imagePrompt ?? '')
  }, [draft?.imagePrompt])

  if (!draft) return null

  const generateForPlatform = async (platform: Platform) => {
    setLoading(true)
    const size = platform === 'xhs' ? '1080x1440' : '900x383'
    const config = loadAiConfig()
    const response = await fetch(`/api/v1/drafts/${draftId}/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiBase: config.imageApiBase || config.llmApiBase,
        apiKey: config.imageApiKey,
        model: config.imageModel,
        prompt: prompt || `Cover for: ${draft.topic}`,
        platform,
        size,
      }),
    })
    if (response.ok) {
      const image = (await response.json()) as DraftImage
      addImage(image)
    } else {
      alert('图片生成失败，请稍后重试')
    }
    setLoading(false)
  }

  const selectCover = async (platform: Platform, imageId: string) => {
    const selectedCoverByPlatform = {
      ...draft.selectedCoverByPlatform,
      [platform]: imageId,
    }
    updateDraft(draftId, { selectedCoverByPlatform })
    const response = await fetch(`/api/v1/drafts/${draftId}/images/${imageId}/select`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        selectedCoverByPlatform,
      }),
    })
    if (response.ok) {
      const updated = (await response.json()) as ContentDraft
      updateDraft(draftId, updated)
    }
  }

  const handleUpload = (platform: Platform, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('文件不能超过 5MB')
      return
    }
    const dims = platform === 'xhs' ? { width: 1080, height: 1440 } : { width: 900, height: 383 }
    const reader = new FileReader()
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return
      const response = await fetch(`/api/v1/drafts/${draftId}/images/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: reader.result,
          platform,
          ...dims,
        }),
      })
      if (response.ok) {
        const image = (await response.json()) as DraftImage
        addImage(image)
      } else {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        alert(data?.error ?? '图片上传失败')
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <TopBar title="配图 Lab" breadcrumb="Studio / 配图" />
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <StudioStepper draftId={draftId} />

        <Card>
          <CardBody className="space-y-4">
            <Label>配图 Prompt</Label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} />
            <div className="flex flex-wrap gap-2">
              {draft.platformTargets.map((p) => (
                <Button key={p} disabled={loading} onClick={() => generateForPlatform(p)}>
                  <Sparkles className="h-4 w-4" />
                  生成{p === 'xhs' ? '小红书' : '公众号'}封面
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {draft.platformTargets.map((platform) => {
            const platformImages = draftImages.filter((i) => i.platform === platform || !i.platform)
            const selectedId = draft.selectedCoverByPlatform[platform]
            return (
              <Card key={platform}>
                <CardBody>
                  <h3 className="font-semibold mb-3">
                    {platform === 'xhs' ? '小红书 3:4' : '公众号 2.35:1'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {platformImages.slice(-4).map((img) => (
                      <button
                        key={img.id}
                        onClick={() => selectCover(platform, img.id)}
                        className={cn(
                          'overflow-hidden rounded-lg border-2',
                          selectedId === img.id ? 'border-indigo-600' : 'border-transparent',
                          platform === 'xhs' ? 'aspect-[3/4]' : 'aspect-[2.35/1]'
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-indigo-600">
                    <Upload className="h-4 w-4" />
                    上传替换
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleUpload(platform, f)
                      }}
                    />
                  </label>
                </CardBody>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => router.push(`/studio/${draftId}/adapt`)}>
            下一步：平台适配 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}
