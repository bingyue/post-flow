import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-gradient-to-r from-blue-600 to-rose-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)] hover:from-blue-700 hover:to-rose-700 hover:-translate-y-0.5',
  secondary:
    'border border-rose-200 bg-white/85 text-rose-700 shadow-sm hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:-translate-y-0.5',
  ghost: 'text-slate-600 hover:bg-rose-50 hover:text-rose-700',
  xhs: 'bg-[#FF2442] text-white shadow-sm hover:bg-[#e0203a] hover:-translate-y-0.5',
  wechat: 'bg-[#07C160] text-white shadow-sm hover:bg-[#06ae56] hover:-translate-y-0.5',
} as const

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}
