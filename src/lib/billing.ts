import type { User } from '@/types'

export type BillingCycle = 'monthly' | 'yearly'
export type PlanKey = User['plan']

export interface PlanFeature {
  label: string
  highlighted?: boolean
}

export interface Plan {
  key: PlanKey
  name: string
  tagline: string
  audience: string
  monthlyPrice: number
  yearlyPrice: number
  quota: number
  platformLimit: string
  seats: string
  cta: string
  featured?: boolean
  features: PlanFeature[]
}

export const PLAN_CATALOG: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    tagline: '验证第一条发布闭环',
    audience: '试用者 / 新创作者',
    monthlyPrice: 0,
    yearlyPrice: 0,
    quota: 5,
    platformLimit: '1 个平台连接',
    seats: '1 seat',
    cta: '当前免费体验',
    features: [
      { label: '5 篇/月 AI 图文创作', highlighted: true },
      { label: '1 个平台账号连接' },
      { label: '基础草稿箱与发布日志' },
      { label: '无定时发布' },
    ],
  },
  {
    key: 'creator',
    name: 'Creator',
    tagline: '独立博主的稳定产能档',
    audience: '独立自媒体 / 个人 IP',
    monthlyPrice: 79,
    yearlyPrice: 699,
    quota: 50,
    platformLimit: '3 个平台连接',
    seats: '1 seat',
    cta: '开通 Creator',
    featured: true,
    features: [
      { label: '50 篇/月 AI 创作 + 配图', highlighted: true },
      { label: '小红书、公众号、微博等 3 平台' },
      { label: '定时发布与失败重试' },
      { label: '基础数据看板' },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: '品牌运营和增长团队档',
    audience: '品牌社媒运营 / 小团队',
    monthlyPrice: 199,
    yearlyPrice: 1699,
    quota: 200,
    platformLimit: '全平台连接',
    seats: '3 seats',
    cta: '升级 Pro',
    features: [
      { label: '200 篇/月 AI 创作 + 配图', highlighted: true },
      { label: '品牌风格记忆库 Mock' },
      { label: '3 seat 协作额度' },
      { label: '高级发布数据与 ROI 摘要' },
    ],
  },
  {
    key: 'team',
    name: 'Team',
    tagline: 'MCN / 代运营商业化方案',
    audience: 'MCN / 代运营 / 多账号团队',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    quota: 1000,
    platformLimit: '无限平台账号',
    seats: '10 seats 起',
    cta: '联系开通 Team',
    features: [
      { label: '1000 篇/月起，可定制额度', highlighted: true },
      { label: '审批流、API、角色权限 Mock' },
      { label: '专属客服与连接器 SLA' },
      { label: '发票与对公付款支持' },
    ],
  },
]

export const CREDIT_PACKS = [
  { id: 'starter', name: '灵感包', credits: 20, price: 29, note: '适合临时冲刺选题' },
  { id: 'growth', name: '增长包', credits: 100, price: 129, note: '单篇约 ¥1.29' },
  { id: 'agency', name: '代运营包', credits: 500, price: 499, note: '团队内容排期专用' },
]

export const MOCK_INVOICES = [
  { id: 'INV-202607-001', item: 'Creator 年付订阅', amount: 699, status: '待支付', date: '2026-07-05' },
  { id: 'INV-202606-014', item: 'AI 额度加购 · 增长包', amount: 129, status: '已完成', date: '2026-06-20' },
  { id: 'INV-202606-002', item: 'Free 试用额度', amount: 0, status: '已完成', date: '2026-06-01' },
]

export function getPlan(plan: PlanKey | undefined) {
  return PLAN_CATALOG.find((item) => item.key === plan) ?? PLAN_CATALOG[0]
}

export function getPlanPrice(plan: Plan, cycle: BillingCycle) {
  return cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
}

export function getMonthlyEquivalent(plan: Plan, cycle: BillingCycle) {
  if (cycle === 'monthly') return plan.monthlyPrice
  return Math.round(plan.yearlyPrice / 12)
}
