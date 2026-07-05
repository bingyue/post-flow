'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Clock,
  Link2,
  ScrollText,
  Settings,
  PenSquare,
  Sparkles,
  Menu,
  X,
  UserCircle,
  CreditCard,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { href: '/studio/new', label: '新建创作', icon: PenSquare },
  { href: '/drafts', label: '草稿箱', icon: FileText },
  { href: '/queue', label: '定时队列', icon: Clock },
  { href: '/accounts', label: '平台账号', icon: Link2 },
  { href: '/logs', label: '发布日志', icon: ScrollText },
  { href: '/profile', label: '个人主页', icon: UserCircle },
  { href: '/billing', label: '会员支付', icon: CreditCard },
  { href: '/settings', label: '设置', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useDemoStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const content = (
    <>
      <div className="border-b border-rose-100/80 px-4 py-5">
        <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-blue-600 shadow-[0_14px_30px_rgba(225,29,72,0.28)]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-display text-base font-bold text-slate-950">PostFlow</div>
          <div className="text-xs font-medium text-rose-500">创流 · AI Studio</div>
        </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-rose-50 to-blue-50 text-rose-700 shadow-sm ring-1 ring-rose-100'
                  : 'text-slate-600 hover:bg-white hover:text-rose-700 hover:shadow-sm'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
        {user?.isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
              pathname.startsWith('/admin')
                ? 'bg-gradient-to-r from-rose-50 to-blue-50 text-rose-700 shadow-sm ring-1 ring-rose-100'
                : 'text-slate-600 hover:bg-white hover:text-rose-700 hover:shadow-sm'
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            管理后台
          </Link>
        )}
      </nav>
      {user && (
        <div className="m-3 rounded-2xl border border-rose-100 bg-white/75 p-4 text-xs text-slate-500 shadow-sm">
          <div className="truncate font-medium text-slate-700">{user.email}</div>
          <div className="mt-2 flex items-center justify-between">
            <span>AI 额度</span>
            <span className="font-semibold text-rose-600">{user.aiQuotaUsed}/{user.aiQuotaLimit}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-rose-600"
              style={{ width: `${Math.min(100, (user.aiQuotaUsed / Math.max(1, user.aiQuotaLimit)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 rounded-xl border border-rose-100 bg-white/90 p-2 shadow-lg backdrop-blur md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-rose-100/80 bg-white/70 backdrop-blur-xl md:flex">
        {content}
      </aside>
      {mobileOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-rose-100 bg-white/95 shadow-xl backdrop-blur md:hidden">
          <button className="absolute right-3 top-4 rounded-full p-1 hover:bg-rose-50" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
          {content}
        </aside>
      )}
    </>
  )
}
