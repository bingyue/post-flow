'use client'

import { useMemo, useState } from 'react'
import {
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Crown,
  FileText,
  Landmark,
  PackagePlus,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Dialog, Toast } from '@/components/ui/Dialog'
import { TopBar } from '@/components/layout/TopBar'
import {
  CREDIT_PACKS,
  MOCK_INVOICES,
  PLAN_CATALOG,
  type BillingCycle,
  type Plan,
  getMonthlyEquivalent,
  getPlan,
  getPlanPrice,
} from '@/lib/billing'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/lib/store/DemoStoreContext'

type PaymentMethod = 'wechat' | 'alipay' | 'stripe' | 'bank'
type CheckoutTarget =
  | { type: 'plan'; plan: Plan }
  | { type: 'credits'; pack: (typeof CREDIT_PACKS)[number] }
  | null

const PAYMENT_METHODS: Array<{
  key: PaymentMethod
  name: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'wechat', name: '微信支付', desc: '个人创作者常用', icon: QrCode },
  { key: 'alipay', name: '支付宝', desc: '支持花呗与余额', icon: WalletCards },
  { key: 'stripe', name: 'Stripe', desc: '海外卡 / USD 结算 Mock', icon: CreditCard },
  { key: 'bank', name: '对公转账', desc: 'Team / 发票场景', icon: Landmark },
]

function priceText(plan: Plan, cycle: BillingCycle) {
  const price = getPlanPrice(plan, cycle)
  if (price === 0) return '¥0'
  return `¥${price}${cycle === 'monthly' ? '/月' : '/年'}`
}

export default function BillingPage() {
  const { user, updateUser } = useDemoStore()
  const currentPlan = getPlan(user?.plan)
  const [cycle, setCycle] = useState<BillingCycle>('yearly')
  const [selectedPlanKey, setSelectedPlanKey] = useState(currentPlan.key)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat')
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget>(null)
  const [toast, setToast] = useState('')

  const selectedPlan = useMemo(
    () => PLAN_CATALOG.find((plan) => plan.key === selectedPlanKey) ?? currentPlan,
    [currentPlan, selectedPlanKey]
  )

  const checkoutAmount =
    checkoutTarget?.type === 'plan'
      ? getPlanPrice(checkoutTarget.plan, cycle)
      : checkoutTarget?.type === 'credits'
        ? checkoutTarget.pack.price
        : 0

  const confirmCheckout = () => {
    if (!checkoutTarget) return

    if (checkoutTarget.type === 'plan') {
      updateUser({
        plan: checkoutTarget.plan.key,
        aiQuotaLimit: checkoutTarget.plan.quota,
        aiQuotaUsed: Math.min(user?.aiQuotaUsed ?? 0, checkoutTarget.plan.quota),
      })
      setSelectedPlanKey(checkoutTarget.plan.key)
      setToast(`已模拟开通 ${checkoutTarget.plan.name} 套餐`)
    } else {
      updateUser({
        aiQuotaLimit: (user?.aiQuotaLimit ?? currentPlan.quota) + checkoutTarget.pack.credits,
      })
      setToast(`已模拟购买 ${checkoutTarget.pack.name}，增加 ${checkoutTarget.pack.credits} 篇额度`)
    }

    setCheckoutTarget(null)
  }

  return (
    <>
      <TopBar title="会员与支付" breadcrumb="商业化中心" />
      <div className="p-6 space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-xl shadow-indigo-100">
            <div className="relative p-8">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />
              <div className="absolute bottom-0 left-20 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="relative">
                <Badge className="bg-white/10 text-white">PRD 商业化 Mock</Badge>
                <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                  用会员体系把“省时间”变成可验证收入
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                  按 PRD 设计 Free、Creator、Pro、Team 四档：订阅制 + AI 额度加购 + 企业 seat 授权。当前页面只做前端 Mock，不触发真实扣款。
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: '目标 Free→Creator', value: '≥5%' },
                    { label: '核心价格锚点', value: '¥79/月' },
                    { label: 'AI 加购单价', value: '¥1.5/篇' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="mt-1 text-xs text-slate-300">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">当前订阅</h3>
                  <p className="mt-1 text-xs text-slate-500">本卡片展示未来真实账单状态。</p>
                </div>
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="rounded-2xl bg-indigo-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">当前套餐</div>
                    <div className="mt-1 text-3xl font-bold text-slate-950">{currentPlan.name}</div>
                  </div>
                  <Badge color={currentPlan.key === 'free' ? 'warning' : 'success'}>
                    {currentPlan.key === 'free' ? '试用中' : '自动续费 Mock'}
                  </Badge>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{
                      width: `${Math.min(100, Math.round(((user?.aiQuotaUsed ?? 0) / (user?.aiQuotaLimit || currentPlan.quota)) * 100))}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  AI 额度 {user?.aiQuotaUsed ?? 0}/{user?.aiQuotaLimit ?? currentPlan.quota}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <Sparkles className="mb-2 h-5 w-5 text-indigo-600" />
                  <div className="text-sm font-medium">{currentPlan.platformLimit}</div>
                  <p className="mt-1 text-xs text-slate-500">平台连接权益</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <Building2 className="mb-2 h-5 w-5 text-indigo-600" />
                  <div className="text-sm font-medium">{currentPlan.seats}</div>
                  <p className="mt-1 text-xs text-slate-500">协作席位</p>
                </div>
              </div>

              <Button className="w-full" onClick={() => setCheckoutTarget({ type: 'plan', plan: selectedPlan })}>
                继续支付所选套餐 <ChevronRight className="h-4 w-4" />
              </Button>
            </CardBody>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold">选择会员套餐</h3>
              <p className="mt-1 text-xs text-slate-500">从 PRD 收入模型落地的套餐卡片 Mock。</p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(['monthly', 'yearly'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setCycle(item)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition',
                    cycle === item ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                  )}
                >
                  {item === 'monthly' ? '月付' : '年付省 12%+'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 xl:grid-cols-4">
              {PLAN_CATALOG.map((plan) => {
                const selected = selectedPlanKey === plan.key
                const current = currentPlan.key === plan.key
                return (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlanKey(plan.key)}
                    className={cn(
                      'relative rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg',
                      selected ? 'border-indigo-500 bg-indigo-50/60 shadow-md' : 'border-slate-200 bg-white',
                      plan.featured && 'ring-2 ring-indigo-100'
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                        最适合内测转化
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-slate-950">{plan.name}</h4>
                      {current && <Badge color="success">当前</Badge>}
                    </div>
                    <p className="mt-2 min-h-10 text-sm text-slate-500">{plan.tagline}</p>
                    <div className="mt-5">
                      <span className="text-3xl font-bold text-slate-950">{priceText(plan, cycle)}</span>
                      {plan.monthlyPrice > 0 && cycle === 'yearly' && (
                        <div className="mt-1 text-xs text-slate-500">折合约 ¥{getMonthlyEquivalent(plan, cycle)}/月</div>
                      )}
                    </div>
                    <div className="mt-5 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature.label} className="flex gap-2 text-sm text-slate-600">
                          <Check className={cn('mt-0.5 h-4 w-4 shrink-0', feature.highlighted ? 'text-indigo-600' : 'text-slate-400')} />
                          <span>{feature.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-2xl bg-white/80 p-3 text-xs text-slate-500">
                      {plan.platformLimit} · {plan.seats}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">AI 额度加购</h3>
              <p className="mt-1 text-xs text-slate-500">超出套餐后按量购买，符合 PRD 的混合收入模型。</p>
            </CardHeader>
            <CardBody className="space-y-3">
              {CREDIT_PACKS.map((pack) => (
                <div key={pack.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                      <PackagePlus className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-950">{pack.name}</div>
                      <p className="mt-1 text-sm text-slate-500">
                        +{pack.credits} 篇额度 · {pack.note}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold text-slate-950">¥{pack.price}</div>
                    <Button variant="secondary" size="sm" onClick={() => setCheckoutTarget({ type: 'credits', pack })}>
                      加购
                    </Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">支付与账单能力 Mock</h3>
              <p className="mt-1 text-xs text-slate-500">展示未来接 Stripe / 微信支付 / 企业转账后的信息架构。</p>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {PAYMENT_METHODS.map(({ key, name, desc, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key)}
                    className={cn(
                      'rounded-2xl border p-4 text-left transition',
                      paymentMethod === key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="mb-3 h-5 w-5 text-indigo-600" />
                    <div className="font-medium text-slate-950">{name}</div>
                    <p className="mt-1 text-xs text-slate-500">{desc}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> 支付安全说明
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  Mock 阶段仅展示支付流程；生产环境建议后端创建订单、服务端校验支付回调、写入订阅表，并支持发票抬头与对公付款。
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">账单与发票</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              {MOCK_INVOICES.map((invoice) => (
                <div key={invoice.id} className="grid gap-3 border-b border-slate-100 p-4 text-sm last:border-b-0 md:grid-cols-[1.2fr_1fr_0.6fr_0.7fr] md:items-center">
                  <div>
                    <div className="font-medium text-slate-950">{invoice.id}</div>
                    <div className="mt-1 text-xs text-slate-500">{invoice.date}</div>
                  </div>
                  <div className="text-slate-600">{invoice.item}</div>
                  <div className="font-semibold text-slate-950">¥{invoice.amount}</div>
                  <div className="flex items-center justify-between gap-3">
                    <Badge color={invoice.status === '已完成' ? 'success' : 'warning'}>{invoice.status}</Badge>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-3 w-3" /> 发票
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Dialog
        open={Boolean(checkoutTarget)}
        onClose={() => setCheckoutTarget(null)}
        title="确认模拟支付"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCheckoutTarget(null)}>
              取消
            </Button>
            <Button onClick={confirmCheckout}>
              确认支付 Mock <Zap className="h-4 w-4" />
            </Button>
          </>
        }
      >
        {checkoutTarget && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">订单内容</div>
              <div className="mt-1 text-xl font-bold text-slate-950">
                {checkoutTarget.type === 'plan'
                  ? `${checkoutTarget.plan.name} ${cycle === 'monthly' ? '月付' : '年付'}`
                  : `${checkoutTarget.pack.name} · ${checkoutTarget.pack.credits} 篇额度`}
              </div>
              <div className="mt-3 text-3xl font-bold text-indigo-600">¥{checkoutAmount}</div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-sm font-medium text-slate-900">
                支付方式：{PAYMENT_METHODS.find((method) => method.key === paymentMethod)?.name}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                点击确认后只会更新本地 Mock 套餐/额度状态，不会创建真实订单或扣款。
              </p>
            </div>
          </div>
        )}
      </Dialog>

      {toast && <Toast message={toast} type="success" onClose={() => setToast('')} />}
    </>
  )
}
