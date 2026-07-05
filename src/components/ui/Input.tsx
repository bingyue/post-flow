import { cn } from '@/lib/utils'

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-rose-100 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/15',
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
        'min-h-[120px] w-full resize-y rounded-xl border border-rose-100 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/15',
        className
      )}
      {...props}
    />
  )
}

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('mb-1.5 block text-sm font-semibold text-slate-700', className)} {...props}>
      {children}
    </label>
  )
}
