import { prisma } from '@/lib/db/prisma'
import { requireAdminUser } from '@/lib/auth/current-user'

export const PLAN_QUOTA: Record<string, number> = {
  free: 5,
  creator: 50,
  pro: 200,
  team: 1000,
}

export interface AdminOverview {
  userCount: number
  todayUsers: number
  paidUsers: number
  draftCount: number
  publishCount: number
  succeededPublishCount: number
  failedPublishCount: number
  queuedPublishCount: number
  publishSuccessRate: number
  revenueCents: number
  aiQuotaUsed: number
  aiQuotaLimit: number
}

export interface AdminUserRow {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  plan: string
  aiQuotaUsed: number
  aiQuotaLimit: number
  timezone: string
  firstPublishAt?: string
  createdAt: string
  updatedAt: string
  counts: {
    drafts: number
    accounts: number
    publishJobs: number
    orders: number
  }
}

export interface AdminOrderRow {
  id: string
  userId: string
  userEmail?: string
  orderNo: string
  productType: string
  plan: string | null
  amount: number
  currency: string
  status: string
  channel: string
  paidAt?: string
  createdAt: string
  updatedAt: string
  payments: Array<{
    id: string
    provider: string
    amount: number
    status: string
    createdAt: string
  }>
}

export interface AdminPublishJobRow {
  id: string
  userId: string
  userEmail?: string
  draftId: string
  accountId: string
  accountName?: string
  platform: string
  draftTitle: string
  mode: string
  scheduledAt?: string
  status: string
  platformUrl: string | null
  errorCode: string | null
  errorMessage: string | null
  retryCount: number
  createdAt: string
  completedAt?: string
  updatedAt: string
}

export interface AdminUserDetail extends Omit<AdminUserRow, 'counts' | 'updatedAt'> {
  onboardingStep: number
  primaryPlatform: string | null
  accounts: Array<{
    id: string
    platform: string
    nickname: string
    status: string
    lastHealthCheck?: string
    createdAt: string
  }>
  drafts: Array<{
    id: string
    topic: string
    masterTitle: string
    status: string
    updatedAt: string
  }>
  publishJobs: AdminPublishJobRow[]
  orders: AdminOrderRow[]
}

function toIso(date: Date | null | undefined) {
  return date ? date.toISOString() : undefined
}

export async function requireAdmin() {
  return requireAdminUser()
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [
    userCount,
    todayUsers,
    paidUsers,
    draftCount,
    publishCount,
    succeededPublishCount,
    failedPublishCount,
    queuedPublishCount,
    paidOrders,
    quotaAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { plan: { not: 'free' } } }),
    prisma.contentDraft.count(),
    prisma.publishJob.count(),
    prisma.publishJob.count({ where: { status: 'succeeded' } }),
    prisma.publishJob.count({ where: { status: { in: ['failed', 'failed_final'] } } }),
    prisma.publishJob.count({ where: { status: { in: ['queued', 'running'] } } }),
    prisma.order.findMany({ where: { status: 'paid' }, select: { amount: true } }),
    prisma.user.aggregate({ _sum: { aiQuotaUsed: true, aiQuotaLimit: true } }),
  ])

  const revenueCents = paidOrders.reduce((sum, order) => sum + order.amount, 0)

  return {
    userCount,
    todayUsers,
    paidUsers,
    draftCount,
    publishCount,
    succeededPublishCount,
    failedPublishCount,
    queuedPublishCount,
    publishSuccessRate: publishCount > 0 ? Math.round((succeededPublishCount / publishCount) * 100) : 0,
    revenueCents,
    aiQuotaUsed: quotaAgg._sum.aiQuotaUsed ?? 0,
    aiQuotaLimit: quotaAgg._sum.aiQuotaLimit ?? 0,
  }
}

export async function listAdminUsers(query?: string): Promise<AdminUserRow[]> {
  await requireAdmin()
  const users = await prisma.user.findMany({
    where: query
      ? {
          email: { contains: query },
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      _count: {
        select: {
          drafts: true,
          accounts: true,
          publishJobs: true,
          orders: true,
        },
      },
    },
  })

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    plan: user.plan,
    aiQuotaUsed: user.aiQuotaUsed,
    aiQuotaLimit: user.aiQuotaLimit,
    timezone: user.timezone,
    firstPublishAt: toIso(user.firstPublishAt),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    counts: user._count,
  }))
}

export async function getAdminUserDetail(id: string): Promise<AdminUserDetail> {
  await requireAdmin()
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      accounts: { orderBy: { createdAt: 'desc' } },
      drafts: { orderBy: { updatedAt: 'desc' }, take: 10 },
      publishJobs: { orderBy: { createdAt: 'desc' }, take: 10 },
      orders: { orderBy: { createdAt: 'desc' }, include: { payments: true } },
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    plan: user.plan,
    aiQuotaUsed: user.aiQuotaUsed,
    aiQuotaLimit: user.aiQuotaLimit,
    timezone: user.timezone,
    onboardingStep: user.onboardingStep,
    primaryPlatform: user.primaryPlatform,
    firstPublishAt: toIso(user.firstPublishAt),
    createdAt: user.createdAt.toISOString(),
    accounts: user.accounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      nickname: account.nickname,
      status: account.status,
      lastHealthCheck: toIso(account.lastHealthCheck),
      createdAt: account.createdAt.toISOString(),
    })),
    drafts: user.drafts.map((draft) => ({
      id: draft.id,
      topic: draft.topic,
      masterTitle: draft.masterTitle,
      status: draft.status,
      updatedAt: draft.updatedAt.toISOString(),
    })),
    publishJobs: user.publishJobs.map(mapAdminPublishJob),
    orders: user.orders.map(mapAdminOrder),
  }
}

export async function updateAdminUser(
  id: string,
  patch: { plan?: string; aiQuotaLimit?: number; aiQuotaUsed?: number; isAdmin?: boolean }
): Promise<Pick<AdminUserRow, 'id' | 'email' | 'isAdmin' | 'plan' | 'aiQuotaUsed' | 'aiQuotaLimit'>> {
  await requireAdmin()
  const data: Record<string, unknown> = {}
  if (patch.plan !== undefined) data.plan = patch.plan
  if (patch.aiQuotaLimit !== undefined) data.aiQuotaLimit = patch.aiQuotaLimit
  if (patch.aiQuotaUsed !== undefined) data.aiQuotaUsed = patch.aiQuotaUsed
  if (patch.isAdmin !== undefined) data.isAdmin = patch.isAdmin

  const user = await prisma.user.update({ where: { id }, data })
  return {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    plan: user.plan,
    aiQuotaUsed: user.aiQuotaUsed,
    aiQuotaLimit: user.aiQuotaLimit,
  }
}

export async function listAdminOrders(): Promise<AdminOrderRow[]> {
  await requireAdmin()
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: true, payments: true },
  })
  return orders.map(mapAdminOrder)
}

export async function createAdminOrder(input: {
  userId: string
  productType: string
  plan?: string
  amount: number
  channel?: string
}): Promise<AdminOrderRow> {
  await requireAdmin()
  const order = await prisma.order.create({
    data: {
      userId: input.userId,
      orderNo: `PF${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      productType: input.productType,
      plan: input.plan,
      amount: input.amount,
      channel: input.channel ?? 'manual',
      status: 'pending',
    },
    include: { user: true, payments: true },
  })
  return mapAdminOrder(order)
}

export async function markAdminOrderPaid(id: string): Promise<AdminOrderRow> {
  await requireAdmin()
  const order = await prisma.order.findUniqueOrThrow({ where: { id } })
  const paidAt = new Date()
  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: 'paid', paidAt },
      include: { user: true, payments: true },
    }),
    prisma.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        provider: order.channel,
        amount: order.amount,
        status: 'succeeded',
        providerTradeNo: `MOCK-${Date.now()}`,
      },
    }),
    ...(order.plan
      ? [
          prisma.user.update({
            where: { id: order.userId },
            data: {
              plan: order.plan,
              aiQuotaLimit: PLAN_QUOTA[order.plan] ?? PLAN_QUOTA.free,
            },
          }),
        ]
      : []),
  ])
  return mapAdminOrder(updated)
}

export async function listAdminTasks(status?: string): Promise<AdminPublishJobRow[]> {
  await requireAdmin()
  const jobs = await prisma.publishJob.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: true, account: true },
  })
  return jobs.map(mapAdminPublishJob)
}

export async function cancelAdminTask(id: string): Promise<AdminPublishJobRow> {
  await requireAdmin()
  const job = await prisma.publishJob.update({
    where: { id },
    data: { status: 'cancelled' },
    include: { user: true, account: true },
  })
  return mapAdminPublishJob(job)
}

function mapAdminOrder(order: {
  id: string
  userId: string
  orderNo: string
  productType: string
  plan: string | null
  amount: number
  currency: string
  status: string
  channel: string
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
  user?: { email: string }
  payments?: Array<{ id: string; provider: string; amount: number; status: string; createdAt: Date }>
}): AdminOrderRow {
  return {
    id: order.id,
    userId: order.userId,
    userEmail: order.user?.email,
    orderNo: order.orderNo,
    productType: order.productType,
    plan: order.plan,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    channel: order.channel,
    paidAt: toIso(order.paidAt),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    payments: (order.payments ?? []).map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
    })),
  }
}

function mapAdminPublishJob(job: {
  id: string
  userId: string
  draftId: string
  accountId: string
  platform: string
  draftTitle: string
  mode: string
  scheduledAt: Date | null
  status: string
  platformUrl: string | null
  errorCode: string | null
  errorMessage: string | null
  retryCount: number
  createdAt: Date
  completedAt: Date | null
  updatedAt: Date
  user?: { email: string }
  account?: { nickname: string }
}): AdminPublishJobRow {
  return {
    id: job.id,
    userId: job.userId,
    userEmail: job.user?.email,
    draftId: job.draftId,
    accountId: job.accountId,
    accountName: job.account?.nickname,
    platform: job.platform,
    draftTitle: job.draftTitle,
    mode: job.mode,
    scheduledAt: toIso(job.scheduledAt),
    status: job.status,
    platformUrl: job.platformUrl,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    retryCount: job.retryCount,
    createdAt: job.createdAt.toISOString(),
    completedAt: toIso(job.completedAt),
    updatedAt: job.updatedAt.toISOString(),
  }
}

