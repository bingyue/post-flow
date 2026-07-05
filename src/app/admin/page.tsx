import Link from 'next/link'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getAdminOverview } from '@/lib/admin/data'
import { getCurrentUser } from '@/lib/auth/current-user'

function money(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`
}

export default async function AdminHomePage() {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) return null

  const overview = await getAdminOverview()
  const cards = [
    { label: '注册用户', value: overview.userCount, hint: `今日新增 ${overview.todayUsers}` },
    { label: '付费用户', value: overview.paidUsers, hint: 'plan 非 free' },
    { label: '订单收入', value: money(overview.revenueCents), hint: '已支付订单' },
    { label: '内容草稿', value: overview.draftCount, hint: '全站草稿数' },
    { label: '发布任务', value: overview.publishCount, hint: `成功率 ${overview.publishSuccessRate}%` },
    { label: '失败任务', value: overview.failedPublishCount, hint: `${overview.queuedPublishCount} 个进行中` },
    {
      label: 'AI 额度使用',
      value: `${overview.aiQuotaUsed}/${overview.aiQuotaLimit}`,
      hint: '全站累计',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">管理概览</h2>
          <p className="mt-1 text-sm text-slate-500">查看 PostFlow MVP 的用户、商业化和发布运行状态。</p>
        </div>
        <Badge color="success">共享 SQLite 数据</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardBody>
              <div className="text-sm text-slate-500">{card.label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-950">{card.value}</div>
              <div className="mt-2 text-xs text-slate-400">{card.hint}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { href: '/admin/users', title: '用户管理', desc: '查看注册用户、套餐、额度和用户内容资产。' },
          { href: '/admin/orders', title: '订单/付费', desc: '创建手工订单，标记支付成功并同步套餐。' },
          { href: '/admin/tasks', title: '任务中心', desc: '查看发布任务状态，取消排队或运行中的任务。' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition hover:border-indigo-200 hover:shadow-md">
              <CardHeader>
                <h3 className="font-semibold text-slate-950">{item.title}</h3>
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

