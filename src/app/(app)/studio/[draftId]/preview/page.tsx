'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { StudioStepper } from '@/components/studio/StudioStepper'
import { XhsNoteCard } from '@/components/platform/XhsNoteCard'
import { WechatArticlePreview } from '@/components/platform/WechatArticlePreview'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { ArrowRight } from 'lucide-react'

export default function StudioPreviewPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = use(params)
  const router = useRouter()
  const { drafts, variants, images } = useDemoStore()
  const draft = drafts.find((d) => d.id === draftId)
  const draftVariants = variants.filter((v) => v.draftId === draftId)

  if (!draft) return null

  const getCoverUrl = (platform: 'xhs' | 'wechat_mp') => {
    const imageId = draft.selectedCoverByPlatform[platform]
    const img = images.find((i) => i.id === imageId)
    return img?.url
  }

  return (
    <>
      <TopBar title="发布预览" breadcrumb="Studio / 预览" />
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <StudioStepper draftId={draftId} />

        <p className="text-sm text-slate-500">模拟各平台真实展示效果（近似预览，非像素级）</p>

        <div className="flex flex-wrap gap-8 justify-center py-6">
          {draftVariants
            .filter((v) => draft.platformTargets.includes(v.platform))
            .map((v) =>
              v.platform === 'xhs' ? (
                <div key={v.id}>
                  <div className="text-sm font-medium text-slate-500 mb-3 text-center">小红书</div>
                  <XhsNoteCard
                    title={v.title}
                    body={v.body}
                    coverUrl={getCoverUrl('xhs')}
                    tags={v.tags}
                  />
                </div>
              ) : (
                <div key={v.id} className="w-full max-w-md">
                  <div className="text-sm font-medium text-slate-500 mb-3">微信公众号</div>
                  <WechatArticlePreview
                    title={v.title}
                    body={v.body}
                    coverUrl={getCoverUrl('wechat_mp')}
                  />
                </div>
              )
            )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => router.push(`/studio/${draftId}/publish`)}>
            下一步：发布 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}
