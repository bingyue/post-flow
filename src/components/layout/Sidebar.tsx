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
      <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-slate-900">PostFlow</div>
          <div className="text-xs text-slate-500">创流 · Demo</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      {user && (
        <div className="border-t border-slate-100 p-4 text-xs text-slate-500">
          <div className="truncate font-medium text-slate-700">{user.email}</div>
          <div className="mt-1">AI 额度 {user.aiQuotaUsed}/{user.aiQuotaLimit}</div>
        </div>
      )}
    </>
  )

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex min-h-screen">
        {content}
      </aside>
      {mobileOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white shadow-xl md:hidden">
          <button className="absolute right-3 top-4" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
          {content}
        </aside>
      )}
    </>
  )
}
