import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { listAdminUsers } from '@/lib/admin/data'
import { getCurrentUser } from '@/lib/auth/current-user'

interface Props {
  searchParams?: Promise<{ q?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) return null

  const params = await searchParams
  const q = params?.q ?? ''
  const users = await listAdminUsers(q)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">用户管理</h2>
        <p className="mt-1 text-sm text-slate-500">查看注册用户、套餐、额度与核心资产数量。</p>
      </div>

      <Card>
        <CardBody>
          <form className="flex flex-wrap gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="搜索用户邮箱"
              className="min-w-72 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <Button type="submit">搜索</Button>
            <Link href="/admin/users">
              <Button type="button" variant="secondary">
                重置
              </Button>
            </Link>
          </form>
        </CardBody>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">邮箱</th>
                <th className="px-4 py-3">套餐</th>
                <th className="px-4 py-3">AI 额度</th>
                <th className="px-4 py-3">草稿</th>
                <th className="px-4 py-3">账号</th>
                <th className="px-4 py-3">任务</th>
                <th className="px-4 py-3">注册时间</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">{user.email}</div>
                    {user.isAdmin && <Badge color="info">管理员</Badge>}
                  </td>
                  <td className="px-4 py-3">{user.plan}</td>
                  <td className="px-4 py-3">
                    {user.aiQuotaUsed}/{user.aiQuotaLimit}
                  </td>
                  <td className="px-4 py-3">{user.counts.drafts}</td>
                  <td className="px-4 py-3">{user.counts.accounts}</td>
                  <td className="px-4 py-3">{user.counts.publishJobs}</td>
                  <td className="px-4 py-3">{new Date(user.createdAt).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.id}`} className="text-indigo-600 hover:underline">
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                    暂无用户
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

