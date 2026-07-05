'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-white/70 bg-white/95 shadow-[0_32px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-rose-50 px-6 py-5">
          <h3 className="font-display text-lg font-semibold text-slate-950">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-rose-50 px-6 py-5">{footer}</div>}
      </div>
    </div>
  )
}

export function Toast({
  message,
  type = 'info',
  onClose,
}: {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  onClose: () => void
}) {
  const colors = {
    info: 'bg-slate-900',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    error: 'bg-red-600',
  }
  return (
    <div className={cn('fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]', colors[type])}>
      <span className="text-sm">{message}</span>
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
        关闭
      </Button>
    </div>
  )
}
