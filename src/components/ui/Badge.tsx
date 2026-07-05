import { cn } from '@/lib/utils'

const colors: Record<string, string> = {
  default: 'border-slate-200 bg-white text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  xhs: 'border-[#FF2442]/20 bg-[#FF2442]/10 text-[#FF2442]',
  wechat: 'border-[#07C160]/20 bg-[#07C160]/10 text-[#058f48]',
}

export function Badge({
  children,
  color = 'default',
  className,
}: {
  children: React.ReactNode
  color?: keyof typeof colors
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  )
}
