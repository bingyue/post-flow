'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { StudioStep } from '@/types'

const STEPS: { key: StudioStep; label: string; suffix: string }[] = [
  { key: 'edit', label: '创作', suffix: '' },
  { key: 'images', label: '配图', suffix: '/images' },
  { key: 'adapt', label: '适配', suffix: '/adapt' },
  { key: 'preview', label: '预览', suffix: '/preview' },
  { key: 'publish', label: '发布', suffix: '/publish' },
]

export function StudioStepper({ draftId }: { draftId: string }) {
  const pathname = usePathname()
  const currentIdx = STEPS.findIndex((s) => {
    const path = `/studio/${draftId}${s.suffix}`
    return pathname === path || (s.key === 'edit' && pathname === `/studio/${draftId}`)
  })

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {STEPS.map((step, idx) => {
        const href = `/studio/${draftId}${step.suffix}`
        const done = idx < currentIdx
        const active = idx === currentIdx
        return (
          <div key={step.key} className="flex items-center">
            <Link
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                active && 'bg-indigo-600 text-white',
                done && !active && 'bg-indigo-100 text-indigo-700',
                !active && !done && 'bg-slate-100 text-slate-500'
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">{idx + 1}</span>}
              {step.label}
            </Link>
            {idx < STEPS.length - 1 && <div className="mx-1 h-px w-4 bg-slate-200" />}
          </div>
        )
      })}
    </div>
  )
}
