'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { Button } from '@/components/ui/Button'
import { LogOut } from 'lucide-react'

export function TopBar({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  const { data: session } = useSession()
  const { user, logout, expiredAccounts } = useDemoStore()
  const planLabel = session?.user?.plan === 'free' ? '免费版' : session?.user?.plan

  return (
    <header className="sticky top-0 z-30 border-b border-rose-100/80 bg-white/75 px-6 py-4 shadow-sm backdrop-blur-xl md:pl-6 pl-16">
      <div className="flex items-center justify-between">
        <div>
          {breadcrumb && <div className="mb-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">{breadcrumb}</div>}
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {session?.user && (
            <div className="hidden rounded-2xl border border-rose-100 bg-white/70 px-3 py-2 text-right text-xs shadow-sm md:block">
              <div className="font-medium text-slate-700">{session.user.email}</div>
              <div className="font-semibold text-rose-500">{planLabel}</div>
            </div>
          )}
          {user && (
            <div className="hidden rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-right text-xs sm:block">
              <div className="text-slate-500">AI 额度</div>
              <div className="font-semibold text-blue-700">
                {user.aiQuotaUsed} / {user.aiQuotaLimit}
              </div>
            </div>
          )}
          {expiredAccounts.length > 0 && (
            <Link href="/accounts">
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm">
                {expiredAccounts.length} 个账号需重新授权
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              void signOut({ callbackUrl: '/login' })
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
