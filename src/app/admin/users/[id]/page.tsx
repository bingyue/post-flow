import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getAdminUserDetail, updateAdminUser } from '@/lib/admin/data'
import { getCurrentUser } from '@/lib/auth/current-user'
import { platformLabel, statusLabel } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

async function updateUserAction(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  await updateAdminUser(id, {
    plan: String(formData.get('plan')),
    aiQuotaLimit: Number(formData.get('aiQuotaLimit')),
    aiQuotaUsed: Number(formData.get('aiQuotaUsed')),
    isAdmin: formData.get('isAdmin') === 'on',
  })
  revalidatePath(`/admin/users/${id}`)
  revalidatePath('/admin/users')
}

export default async function AdminUserDetailPage({ params }: Props) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) return null

  const { id } = await params
  const user = await getAdminUserDetail(id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/users" className="text-sm text-indigo-600 hover:underline">
            返回用户列表
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{user.email}</h2>
          <p className="mt-1 text-sm text-slate-500">注册于 {new Date(user.createdAt).toLocaleString('zh-CN')}</p>
        </div>
        {user.isAdmin && <Badge color="info">管理员账号</Badge>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">套餐与额度</h3>
          </CardHeader>
          <CardBody>
            <form action={updateUserAction} className="space-y-4">
              <input type="hidden" name="id" value={user.id} />
              <label className="block text-sm">
                <span className="text-slate-600">套餐</span>
                <select
                  name="plan"
                  defaultValue={user.plan}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="free">free</option>
                  <option value="creator">creator</option>
                  <option value="pro">pro</option>
                  <option value="team">team</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">AI 已用额度</span>
                <input
                  name="aiQuotaUsed"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={user.aiQuotaUsed}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">AI 额度上限</span>
                <input
                  name="aiQuotaLimit"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={user.aiQuotaLimit}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="isAdmin" type="checkbox" defaultChecked={user.isAdmin} />
                管理员权限
              </label>
              <Button type="submit">保存调整</Button>
            </form>
          </CardBody>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: '平台账号', value: user.accounts.length },
            { label: '近期草稿', value: user.drafts.length },
            { label: '发布任务', value: user.publishJobs.length },
          ].map((item) => (
            <Card key={item.label}>
              <CardBody>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{item.value}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">近期草稿</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {user.drafts.map((draft) => (
              <div key={draft.id} className="rounded-lg border border-slate-100 p-3">
                <div className="font-medium text-slate-950">{draft.masterTitle || draft.topic}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {statusLabel(draft.status)} · {new Date(draft.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            ))}
            {user.drafts.length === 0 && <p className="text-sm text-slate-500">暂无草稿</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">平台账号</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {user.accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div>
                  <div className="font-medium text-slate-950">{account.nickname}</div>
                  <div className="mt-1 text-xs text-slate-500">{platformLabel(account.platform as 'xhs' | 'wechat_mp')}</div>
                </div>
                <Badge color={account.status === 'active' ? 'success' : 'warning'}>{statusLabel(account.status)}</Badge>
              </div>
            ))}
            {user.accounts.length === 0 && <p className="text-sm text-slate-500">暂无平台账号</p>}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">发布任务</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {user.publishJobs.map((job) => (
            <div key={job.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-slate-950">{job.draftTitle}</div>
                <Badge color={job.status === 'succeeded' ? 'success' : job.status === 'failed' ? 'danger' : 'default'}>
                  {statusLabel(job.status)}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {platformLabel(job.platform as 'xhs' | 'wechat_mp')} · {new Date(job.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          ))}
          {user.publishJobs.length === 0 && <p className="text-sm text-slate-500">暂无发布任务</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">订单记录</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {user.orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
              <div>
                <div className="font-medium text-slate-950">{order.orderNo}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {order.productType} · {order.plan ?? '无套餐'} · ¥{(order.amount / 100).toFixed(2)}
                </div>
              </div>
              <Badge color={order.status === 'paid' ? 'success' : 'warning'}>{order.status}</Badge>
            </div>
          ))}
          {user.orders.length === 0 && <p className="text-sm text-slate-500">暂无订单</p>}
        </CardBody>
      </Card>
    </div>
  )
}

