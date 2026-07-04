'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import type { Platform } from '@/types'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { title: '选择主要平台', desc: '选择你最常发布内容的平台' },
  { title: '连接平台账号', desc: '绑定小红书或微信公众号' },
  { title: '完成首篇创作', desc: '用 AI 生成你的第一篇图文' },
  { title: '发布首篇内容', desc: '预览确认后发布到平台' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { updateUser, connectAccount, createDraft } = useDemoStore()
  const [step, setStep] = useState(0)
  const [platform, setPlatform] = useState<Platform>('xhs')

  const next = () => {
    if (step === 0) {
      updateUser({ primaryPlatform: platform, onboardingStep: 1 })
      setStep(1)
    } else if (step === 1) {
      connectAccount(platform)
      updateUser({ onboardingStep: 2 })
      setStep(2)
    } else if (step === 2) {
      const draft = createDraft({
        topic: '我的第一篇 PostFlow 创作',
        platformTargets: [platform],
        masterTitle: 'PostFlow 首篇测试',
        masterBody: '这是通过引导流程创建的第一篇内容…',
        masterTags: ['PostFlow', '测试'],
      })
      updateUser({ onboardingStep: 3 })
      router.push(`/studio/${draft.id}`)
    } else {
      updateUser({ onboardingStep: 4, firstPublishAt: new Date().toISOString() })
      router.push('/dashboard')
    }
  }

  return (
    <>
      <TopBar title="新用户引导" />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8 flex justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  i < step && 'bg-indigo-600 text-white',
                  i === step && 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600',
                  i > step && 'bg-slate-100 text-slate-400'
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="mt-2 text-xs text-center text-slate-500 hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardBody className="py-8">
            <h2 className="text-xl font-semibold">{STEPS[step].title}</h2>
            <p className="mt-2 text-slate-500">{STEPS[step].desc}</p>

            {step === 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {(['xhs', 'wechat_mp'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={cn(
                      'rounded-xl border-2 p-6 text-center transition-colors',
                      platform === p ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="text-lg font-semibold">{p === 'xhs' ? '小红书' : '微信公众号'}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-600">
                点击下方按钮模拟连接 {platform === 'xhs' ? '小红书' : '微信公众号'} 账号
              </div>
            )}

            {step >= 2 && (
              <div className="mt-6 rounded-lg bg-indigo-50 p-6 text-sm text-indigo-800">
                {step === 2 ? '将创建示例草稿并进入创作 Studio' : '恭喜完成引导！'}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              {step > 0 && step < 3 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  上一步
                </Button>
              )}
              <Button onClick={next}>{step === 3 ? '进入工作台' : '下一步'}</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
