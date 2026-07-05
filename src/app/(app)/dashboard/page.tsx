'use client'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { formatDate, platformLabel, statusLabel } from '@/lib/utils'
import { AlertCircle, Plus, ArrowRight } from 'lucide-react'

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
      <div className="p-6 space-y-6">
        {expiredAccounts.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {expiredAccounts.map((a) => a.nickname).join('、')} 授权已过期
            </span>
            <Link href="/accounts" className="ml-auto font-medium underline">
              重新连接
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">欢迎回来</h2>
            <p className="text-sm text-slate-500">管理你的创作与发布任务</p>
          </div>
          <Link href={quotaExceeded ? '/billing' : '/studio/new'}>
            <Button disabled={quotaExceeded}>
              <Plus className="h-4 w-4" /> 新建创作
            </Button>
          </Link>
        </div>

        {user && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">AI 创作额度</span>
                <span className="text-sm text-slate-500">
                  {user.aiQuotaUsed} / {user.aiQuotaLimit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${(user.aiQuotaUsed / user.aiQuotaLimit) * 100}%` }}
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
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
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
                  <div key={j.id} className="flex items-center justify-between text-sm">
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
                  <tr className="text-left text-slate-500 border-b">
                    <th className="pb-2 font-medium">标题</th>
                    <th className="pb-2 font-medium">平台</th>
                    <th className="pb-2 font-medium">状态</th>
                    <th className="pb-2 font-medium">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((j) => (
                    <tr key={j.id} className="border-b border-slate-50">
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
          <Card className="border-dashed">
            <CardBody className="text-center py-12">
              <h3 className="font-semibold text-lg">完成你的第一篇发布</h3>
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
