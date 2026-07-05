import Link from 'next/link'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getAdminOverview } from '@/lib/admin/data'
import { getCurrentUser } from '@/lib/auth/current-user'
import { Activity, CreditCard, FileText, Users } from 'lucide-react'

function money(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`
}

export default async function AdminHomePage() {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) return null

  const overview = await getAdminOverview()
  const cards = [
    { label: '注册用户', value: overview.userCount, hint: `今日新增 ${overview.todayUsers}`, icon: Users },
    { label: '付费用户', value: overview.paidUsers, hint: 'plan 非 free', icon: CreditCard },
    { label: '订单收入', value: money(overview.revenueCents), hint: '已支付订单', icon: CreditCard },
    { label: '内容草稿', value: overview.draftCount, hint: '全站草稿数', icon: FileText },
    { label: '发布任务', value: overview.publishCount, hint: `成功率 ${overview.publishSuccessRate}%`, icon: Activity },
    { label: '失败任务', value: overview.failedPublishCount, hint: `${overview.queuedPublishCount} 个进行中`, icon: Activity },
    {
      label: 'AI 额度使用',
      value: `${overview.aiQuotaUsed}/${overview.aiQuotaLimit}`,
      hint: '全站累计',
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="relative flex flex-wrap items-end justify-between gap-4 p-8">
          <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-rose-500/25 blur-3xl" />
          <div className="absolute bottom-0 right-32 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative">
            <Badge className="border-white/15 bg-white/10 text-white">Super Admin</Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">管理概览</h2>
            <p className="mt-2 text-sm text-slate-300">查看 PostFlow MVP 的用户、商业化和发布运行状态。</p>
          </div>
          <Badge color="success" className="relative">共享 SQLite 数据</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
          <Card key={card.label}>
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-500">{card.label}</div>
                <div className="mt-2 font-display text-3xl font-bold text-slate-950">{card.value}</div>
                <div className="mt-2 text-xs text-slate-400">{card.hint}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Icon className="h-5 w-5" />
              </div>
            </CardBody>
          </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { href: '/admin/users', title: '用户管理', desc: '查看注册用户、套餐、额度和用户内容资产。' },
          { href: '/admin/orders', title: '订单/付费', desc: '创建手工订单，标记支付成功并同步套餐。' },
          { href: '/admin/tasks', title: '任务中心', desc: '查看发布任务状态，取消排队或运行中的任务。' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition hover:border-rose-200">
              <CardHeader>
                <h3 className="font-display font-semibold text-slate-950">{item.title}</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm leading-6 text-slate-500">{item.desc}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

