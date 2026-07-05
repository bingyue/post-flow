import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cancelAdminTask, listAdminTasks } from '@/lib/admin/data'
import { getCurrentUser } from '@/lib/auth/current-user'
import { platformLabel, statusLabel } from '@/lib/utils'

interface Props {
  searchParams?: Promise<{ status?: string }>
}

async function cancelTaskAction(formData: FormData) {
  'use server'
  await cancelAdminTask(String(formData.get('id')))
  revalidatePath('/admin/tasks')
}

function statusColor(status: string) {
  if (status === 'succeeded') return 'success'
  if (status === 'failed' || status === 'failed_final') return 'danger'
  if (status === 'running' || status === 'queued') return 'warning'
  return 'default'
}

export default async function AdminTasksPage({ searchParams }: Props) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) return null

  const params = await searchParams
  const status = params?.status ?? ''
  const jobs = await listAdminTasks(status || undefined)
  const filters = ['', 'queued', 'running', 'succeeded', 'failed', 'cancelled']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">任务中心</h2>
        <p className="mt-1 text-sm text-slate-500">查看所有用户的发布任务状态，必要时取消排队或运行中的任务。</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Link
            key={item || 'all'}
            href={item ? `/admin/tasks?status=${item}` : '/admin/tasks'}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              status === item ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item ? statusLabel(item) : '全部'}
          </Link>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">标题</th>
                <th className="px-4 py-3">用户</th>
                <th className="px-4 py-3">平台</th>
                <th className="px-4 py-3">模式</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">定时时间</th>
                <th className="px-4 py-3">完成时间</th>
                <th className="px-4 py-3">错误</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">{job.draftTitle}</div>
                    <div className="mt-1 text-xs text-slate-400">{job.id}</div>
                  </td>
                  <td className="px-4 py-3">{job.userEmail ?? job.userId}</td>
                  <td className="px-4 py-3">{platformLabel(job.platform as 'xhs' | 'wechat_mp')}</td>
                  <td className="px-4 py-3">{job.mode}</td>
                  <td className="px-4 py-3">
                    <Badge color={statusColor(job.status)}>{statusLabel(job.status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {job.scheduledAt ? new Date(job.scheduledAt).toLocaleString('zh-CN') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {job.completedAt ? new Date(job.completedAt).toLocaleString('zh-CN') : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{job.errorMessage ?? job.errorCode ?? '-'}</td>
                  <td className="px-4 py-3">
                    {['queued', 'running'].includes(job.status) ? (
                      <form action={cancelTaskAction}>
                        <input type="hidden" name="id" value={job.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          取消
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">无操作</span>
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                    暂无任务
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

