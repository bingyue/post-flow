import { cn } from '@/lib/utils'

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y min-h-[100px]',
        className
      )}
      {...props}
    />
  )
}

export function Label({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <label className={cn('block text-sm font-medium text-slate-700 mb-1', className)}>{children}</label>
}
