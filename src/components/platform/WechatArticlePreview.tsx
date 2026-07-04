'use client'

import { cn } from '@/lib/utils'

export function WechatArticlePreview({
  title,
  body,
  coverUrl,
  className,
}: {
  title: string
  body: string
  coverUrl?: string
  className?: string
}) {
  const summary = body.replace(/#+\s/g, '').slice(0, 60) + '…'

  return (
    <div className={cn('flex gap-3 rounded-lg border border-slate-200 bg-white p-3 max-w-md', className)}>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-slate-900 line-clamp-2">{title || '图文标题'}</h4>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{summary}</p>
        <div className="mt-2 text-xs text-slate-400">创流科技 · 刚刚</div>
      </div>
      <div className="h-16 w-[68px] shrink-0 overflow-hidden rounded bg-slate-100">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-400">封面</div>
        )}
      </div>
    </div>
  )
}
