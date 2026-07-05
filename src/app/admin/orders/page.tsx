import { revalidatePath } from 'next/cache'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { createAdminOrder, listAdminOrders, listAdminUsers, markAdminOrderPaid } from '@/lib/admin/data'
import { getCurrentUser } from '@/lib/auth/current-user'

async function createOrderAction(formData: FormData) {
  'use server'
  await createAdminOrder({
    userId: String(formData.get('userId')),
    productType: String(formData.get('productType')),
    plan: String(formData.get('plan') || ''),
    amount: Math.round(Number(formData.get('amountYuan')) * 100),
    channel: String(formData.get('channel') || 'manual'),
  })
  revalidatePath('/admin/orders')
}

async function markPaidAction(formData: FormData) {
  'use server'
  await markAdminOrderPaid(String(formData.get('id')))
  revalidatePath('/admin/orders')
  revalidatePath('/admin/users')
}

export default async function AdminOrdersPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) return null

  const [orders, users] = await Promise.all([listAdminOrders(), listAdminUsers()])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">订单与付费</h2>
        <p className="mt-1 text-sm text-slate-500">MVP 阶段使用手工订单验证付费、套餐和 AI 额度流程。</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">创建手工订单</h3>
        </CardHeader>
        <CardBody>
          <form action={createOrderAction} className="grid gap-3 md:grid-cols-5">
            <select name="userId" required className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">选择用户</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
            <select name="productType" defaultValue="subscription" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="subscription">订阅套餐</option>
              <option value="ai_credit">AI 额度包</option>
            </select>
            <select name="plan" defaultValue="creator" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">不变更套餐</option>
              <option value="creator">creator</option>
              <option value="pro">pro</option>
              <option value="team">team</option>
            </select>
            <input
              name="amountYuan"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="金额（元）"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <Button type="submit">创建订单</Button>
            <input type="hidden" name="channel" value="manual" />
          </form>
        </CardBody>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">订单号</th>
                <th className="px-4 py-3">用户</th>
                <th className="px-4 py-3">商品</th>
                <th className="px-4 py-3">套餐</th>
                <th className="px-4 py-3">金额</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">渠道</th>
                <th className="px-4 py-3">创建时间</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="bg-white">
                  <td className="px-4 py-3 font-medium text-slate-950">{order.orderNo}</td>
                  <td className="px-4 py-3">{order.userEmail ?? order.userId}</td>
                  <td className="px-4 py-3">{order.productType}</td>
                  <td className="px-4 py-3">{order.plan ?? '-'}</td>
                  <td className="px-4 py-3">¥{(order.amount / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge color={order.status === 'paid' ? 'success' : 'warning'}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{order.channel}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    {order.status === 'pending' ? (
                      <form action={markPaidAction}>
                        <input type="hidden" name="id" value={order.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          标记已支付
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">{order.payments.length} 条支付</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                    暂无订单
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

