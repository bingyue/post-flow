import { cn } from '@/lib/utils'

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100/80 bg-white/90 shadow-[0_14px_30px_rgba(225,29,72,0.08)] backdrop-blur transition-all duration-200 hover:border-rose-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('border-b border-rose-50 px-5 py-4', className)}>{children}</div>
}

export function CardBody({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('px-5 py-5', className)}>{children}</div>
}
