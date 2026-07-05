'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  Crown,
  Fingerprint,
  Gauge,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCircle,
  WalletCards,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { TopBar } from '@/components/layout/TopBar'
import { getPlan } from '@/lib/billing'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { formatDate, platformLabel, statusLabel } from '@/lib/utils'

function percentage(value: number, total: number) {
  if (!total) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { user, accounts, drafts, publishJobs, upcomingQueue } = useDemoStore()
  const plan = getPlan(user?.plan)
  const quotaUsed = user?.aiQuotaUsed ?? 0
  const quotaLimit = user?.aiQuotaLimit ?? plan.quota
  const quotaRate = percentage(quotaUsed, quotaLimit)
  const succeededJobs = publishJobs.filter((job) => job.status === 'succeeded')
  const activeAccounts = accounts.filter((account) => account.status === 'active')
  const publishedDrafts = drafts.filter((draft) => draft.status === 'published')

  const stats = [
    { label: '本月 AI 用量', value: `${quotaUsed}/${quotaLimit}`, icon: Sparkles, tone: 'indigo' },
    { label: '已连接平台', value: `${activeAccounts.length}/${accounts.length || plan.platformLimit}`, icon: Fingerprint, tone: 'emerald' },
    { label: '成功发布', value: `${succeededJobs.length} 篇`, icon: BadgeCheck, tone: 'sky' },
    { label: '定时队列', value: `${upcomingQueue.length} 个`, icon: CalendarClock, tone: 'amber' },
  ]

  return (
    <>
      <TopBar title="个人主页" breadcrumb="账户中心" />
      <div className="p-6 space-y-6">
        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-[radial-gradient(circle_at_top_left,#eef2ff,white_38%,#f8fafc)] shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr] lg:p-8">
            <div className="flex flex-col justify-between gap-8">
              <div className="flex flex-wrap items-start gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-xl shadow-indigo-200">
                  <UserCircle className="h-11 w-11" />
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge color="info">{plan.name}</Badge>
                    <Badge color={plan.key === 'free' ? 'warning' : 'success'}>
                      {plan.key === 'free' ? '试用中' : '订阅有效'}
                    </Badge>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                    {session?.user?.email?.split('@')[0] ?? user?.email?.split('@')[0] ?? 'PostFlow Creator'}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    你的创作工作台已经完成登录闭环。这里集中展示身份、订阅、AI 额度、平台连接和发布产能，后续可接真实账单、团队 seat 与发票。
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <Icon className="mb-3 h-5 w-5 text-indigo-600" />
                    <div className="text-2xl font-bold text-slate-950">{value}</div>
                    <div className="mt-1 text-xs text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-slate-900 bg-slate-950 text-white shadow-2xl shadow-indigo-200">
              <CardBody className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-indigo-200">Current Plan</p>
                    <h3 className="mt-2 text-2xl font-bold">{plan.name}</h3>
                  </div>
                  <Crown className="h-8 w-8 text-amber-300" />
                </div>
                <p className="text-sm leading-6 text-slate-300">{plan.tagline}，面向 {plan.audience}。</p>
                <div>
                  <div className="mb-2 flex justify-between text-xs text-slate-300">
                    <span>AI 额度使用</span>
                    <span>{quotaRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-cyan-300" style={{ width: `${quotaRate}%` }} />
                  </div>
                </div>
                <Link href="/billing">
                  <Button className="w-full bg-white text-slate-950 hover:bg-indigo-50">
                    管理会员与支付 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">账号资料</h3>
              <p className="mt-1 text-xs text-slate-500">个人主页 Mock：后续可接资料编辑、头像上传和团队邀请。</p>
            </CardHeader>
            <CardBody className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Mail className="h-4 w-4 text-indigo-600" /> 登录邮箱
                </div>
                <p className="text-sm text-slate-600">{session?.user?.email ?? user?.email ?? '未加载'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <WalletCards className="h-4 w-4 text-indigo-600" /> 商业身份
                </div>
                <p className="text-sm text-slate-600">{plan.audience}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Gauge className="h-4 w-4 text-indigo-600" /> 主力平台
                </div>
                <p className="text-sm text-slate-600">
                  {user?.primaryPlatform ? platformLabel(user.primaryPlatform) : '尚未选择，可在引导中完善'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" /> 安全状态
                </div>
                <p className="text-sm text-slate-600">Auth.js 会话已启用，平台 Token 前端不可见</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">商业化建议</h3>
                  <p className="mt-1 text-xs text-slate-500">根据 PRD 的 Free → Creator 转化假设设计。</p>
                </div>
                <Badge color={plan.key === 'free' ? 'warning' : 'success'}>
                  {plan.key === 'free' ? '建议升级' : '权益已解锁'}
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                `当前套餐包含 ${plan.quota} 篇/月 AI 创作额度`,
                `平台连接权益：${plan.platformLimit}`,
                `协作席位：${plan.seats}`,
                plan.key === 'free' ? '开通 Creator 后可解锁定时发布与 50 篇/月额度' : '可继续加购 AI 额度包应对内容高峰',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 text-sm text-slate-600">
                  <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{item}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="font-semibold">平台与发布资产</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {accounts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm text-slate-500">还没有连接平台账号。</p>
                  <Link href="/accounts" className="mt-4 inline-flex">
                    <Button variant="secondary" size="sm">去连接平台</Button>
                  </Link>
                </div>
              ) : (
                accounts.map((account) => (
                  <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4">
                    <div>
                      <div className="font-medium text-slate-900">{account.nickname}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge color={account.platform === 'xhs' ? 'xhs' : 'wechat'}>{platformLabel(account.platform)}</Badge>
                        <Badge color={account.status === 'active' ? 'success' : 'warning'}>{statusLabel(account.status)}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      最近检查 {account.lastHealthCheck ? formatDate(account.lastHealthCheck) : '未检查'}
                    </p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">增长快照</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <BarChart3 className="mb-3 h-5 w-5 text-indigo-600" />
                <div className="text-2xl font-bold text-slate-950">{publishedDrafts.length}</div>
                <p className="text-xs text-slate-500">已归档发布内容</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <BadgeCheck className="mb-3 h-5 w-5 text-emerald-600" />
                <div className="text-2xl font-bold text-slate-950">95%</div>
                <p className="text-xs text-slate-500">PRD 目标发布成功率 Mock</p>
              </div>
              <Link href="/billing">
                <Button variant="secondary" className="w-full">
                  查看可解锁增长能力
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
