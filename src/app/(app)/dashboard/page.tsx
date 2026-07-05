'use client'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { formatDate, platformLabel, statusLabel } from '@/lib/utils'
import { AlertCircle, Plus, ArrowRight, Sparkles, Clock, FileText } from 'lucide-react'

export default function DashboardPage() {
  const {
    user,
    readyDrafts,
    upcomingQueue,
    recentLogs,
    expiredAccounts,
    drafts,
  } = useDemoStore()

  const quotaExceeded = user ? user.aiQuotaUsed >= user.aiQuotaLimit : false

  return (
    <>
      <TopBar title="工作台" breadcrumb="PostFlow" />
      <div className="space-y-6 p-6">
        {expiredAccounts.length > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {expiredAccounts.map((a) => a.nickname).join('、')} 授权已过期
            </span>
            <Link href="/accounts" className="ml-auto font-medium underline">
              重新连接
            </Link>
          </div>
        )}

        <section className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white/80 shadow-[0_24px_60px_rgba(225,29,72,0.10)] backdrop-blur">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-rose-300/30 blur-3xl" />
            <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-2xl">
                <Badge color="xhs">AI 内容工作流</Badge>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  把选题、图文创作和分发排期收进一个工作台
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  PostFlow 帮你从一个选题生成多平台内容，并把草稿、图片、平台适配和发布任务统一管理。
                </p>
              </div>
              <Link href={quotaExceeded ? '/billing' : '/studio/new'}>
                <Button size="lg" disabled={quotaExceeded}>
                  <Sparkles className="h-5 w-5" /> 新建 AI 创作
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: '全部草稿', value: drafts.length, icon: FileText, tone: 'rose' },
            { label: '待发布内容', value: readyDrafts.length, icon: Plus, tone: 'blue' },
            { label: '7 天内排期', value: upcomingQueue.length, icon: Clock, tone: 'amber' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <Card key={label}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">{label}</div>
                  <div className="mt-2 font-display text-3xl font-bold text-slate-950">{value}</div>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    tone === 'rose'
                      ? 'bg-rose-50 text-rose-600'
                      : tone === 'blue'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {user && (
          <Card className="bg-gradient-to-r from-white to-rose-50/70">
            <CardBody>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">AI 创作额度</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-rose-600 shadow-sm">
                  {user.aiQuotaUsed} / {user.aiQuotaLimit}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-rose-600 transition-all"
                  style={{ width: `${Math.min(100, (user.aiQuotaUsed / Math.max(1, user.aiQuotaLimit)) * 100)}%` }}
                />
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">待发布</h3>
                <Link href="/drafts" className="text-sm text-indigo-600 hover:underline">
                  全部草稿
                </Link>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {readyDrafts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="mb-4">还没有待发布内容</p>
                  <Link href="/onboarding">
                    <Button variant="secondary" size="sm">
                      完成首篇发布引导
                    </Button>
                  </Link>
                </div>
              ) : (
                readyDrafts.map((d) => (
                  <Link
                    key={d.id}
                    href={`/studio/${d.id}/publish`}
                    className="flex items-center justify-between rounded-2xl border border-rose-50 bg-white/70 p-3 transition-all hover:border-rose-100 hover:bg-rose-50/50"
                  >
                    <div>
                      <div className="font-medium text-sm">{d.masterTitle || d.topic}</div>
                      <div className="text-xs text-slate-500 mt-1">{formatDate(d.updatedAt)}</div>
                    </div>
                    <Badge color="success">{statusLabel(d.status)}</Badge>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">定时队列（7 天内）</h3>
                <Link href="/queue" className="text-sm text-indigo-600 hover:underline">
                  查看全部
                </Link>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {upcomingQueue.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">暂无定时任务</p>
              ) : (
                upcomingQueue.slice(0, 5).map((j) => (
                  <div key={j.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 p-3 text-sm">
                    <div>
                      <div className="font-medium">{j.draftTitle}</div>
                      <div className="text-xs text-slate-500">
                        {j.scheduledAt && formatDate(j.scheduledAt)}
                      </div>
                    </div>
                    <Badge color={j.platform === 'xhs' ? 'xhs' : 'wechat'}>
                      {platformLabel(j.platform)}
                    </Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">最近发布</h3>
              <Link href="/logs" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                发布日志 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rose-50 text-left text-slate-500">
                    <th className="pb-2 font-medium">标题</th>
                    <th className="pb-2 font-medium">平台</th>
                    <th className="pb-2 font-medium">状态</th>
                    <th className="pb-2 font-medium">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((j) => (
                    <tr key={j.id} className="border-b border-rose-50/80">
                      <td className="py-3">{j.draftTitle}</td>
                      <td>
                        <Badge color={j.platform === 'xhs' ? 'xhs' : 'wechat'}>
                          {platformLabel(j.platform)}
                        </Badge>
                      </td>
                      <td>
                        <Badge color={j.status === 'succeeded' ? 'success' : j.status === 'failed_final' ? 'danger' : 'warning'}>
                          {statusLabel(j.status)}
                        </Badge>
                      </td>
                      <td className="text-slate-500">{formatDate(j.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {drafts.length === 0 && (
          <Card className="border-dashed border-rose-200 bg-rose-50/60">
            <CardBody className="text-center py-12">
              <h3 className="font-display text-lg font-semibold text-slate-950">完成你的第一篇发布</h3>
              <p className="text-slate-500 mt-2 mb-6">跟随引导，体验完整创作发布流程</p>
              <Link href="/onboarding">
                <Button>开始引导</Button>
              </Link>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  )
}
