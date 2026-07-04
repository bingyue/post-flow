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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t px-5 py-4">{footer}</div>}
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
    info: 'bg-slate-800',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    error: 'bg-red-600',
  }
  return (
    <div className={cn('fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg', colors[type])}>
      <span className="text-sm">{message}</span>
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
        关闭
      </Button>
    </div>
  )
}
