'use client'

import { cn } from '@/lib/utils'
import { Heart, MessageCircle } from 'lucide-react'

export function XhsNoteCard({
  title,
  body,
  coverUrl,
  tags,
  className,
}: {
  title: string
  body: string
  coverUrl?: string
  tags?: string[]
  className?: string
}) {
  const preview = body.split('\n').filter(Boolean).slice(0, 3).join(' ')

  return (
    <div className={cn('w-[280px] overflow-hidden rounded-2xl bg-white shadow-md border border-slate-100', className)}>
      <div className="aspect-[3/4] bg-slate-100 relative">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 text-sm">封面预览</div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">{title || '标题'}</h4>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{preview}</p>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="text-xs text-[#FF2442]">#{t}</span>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-4 text-slate-400">
          <Heart className="h-4 w-4" />
          <MessageCircle className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}
