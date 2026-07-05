import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/current-user'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

const nav = [
  { href: '/admin', label: '概览' },
  { href: '/admin/users', label: '用户' },
  { href: '/admin/orders', label: '订单' },
  { href: '/admin/tasks', label: '任务' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Badge color="warning">需要管理员权限</Badge>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">无法访问管理后台</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            当前账号不是管理员。请使用 `ADMIN_EMAILS` 中配置的账号注册登录，或在数据库中将用户 `isAdmin`
            设置为 true。
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login">
              <Button>去登录</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">返回工作台</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
              返回工作台
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-950">PostFlow 管理后台</h1>
              <Badge color="info">Super Admin</Badge>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  )
}

