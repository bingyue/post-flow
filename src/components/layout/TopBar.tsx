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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-4 md:pl-6 pl-16">
      <div className="flex items-center justify-between">
        <div>
          {breadcrumb && <div className="text-xs text-slate-500 mb-0.5">{breadcrumb}</div>}
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {session?.user && (
            <div className="hidden md:block text-right text-xs">
              <div className="font-medium text-slate-700">{session.user.email}</div>
              <div className="text-slate-500">{planLabel}</div>
            </div>
          )}
          {user && (
            <div className="hidden sm:block text-right text-xs">
              <div className="text-slate-500">AI 额度</div>
              <div className="font-medium">
                {user.aiQuotaUsed} / {user.aiQuotaLimit}
              </div>
            </div>
          )}
          {expiredAccounts.length > 0 && (
            <Link href="/accounts">
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
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
