'use client'

import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { formatDate, platformLabel, statusLabel } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

export default function LogsPage() {
  const { publishJobs } = useDemoStore()
  const sorted = [...publishJobs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return (
    <>
      <TopBar title="发布日志" />
      <div className="p-6">
        <Card>
          <CardBody className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">标题</th>
                  <th className="px-4 py-3 text-left">平台</th>
                  <th className="px-4 py-3 text-left">模式</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-left">错误码</th>
                  <th className="px-4 py-3 text-left">时间</th>
                  <th className="px-4 py-3 text-left">链接</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((j) => (
                  <tr key={j.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{j.draftTitle}</td>
                    <td className="px-4 py-3">
                      <Badge color={j.platform === 'xhs' ? 'xhs' : 'wechat'}>
                        {platformLabel(j.platform)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{j.mode === 'immediate' ? '即时' : '定时'}</td>
                    <td className="px-4 py-3">
                      <Badge
                        color={
                          j.status === 'succeeded'
                            ? 'success'
                            : j.status === 'failed_final'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {statusLabel(j.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                      {j.errorCode ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(j.createdAt)}</td>
                    <td className="px-4 py-3">
                      {j.platformUrl ? (
                        <a
                          href={j.platformUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          查看 <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
