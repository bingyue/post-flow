import { cn } from '@/lib/utils'

const colors: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-indigo-100 text-indigo-700',
  xhs: 'bg-[#FF2442]/10 text-[#FF2442]',
  wechat: 'bg-[#07C160]/10 text-[#07C160]',
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  )
}
