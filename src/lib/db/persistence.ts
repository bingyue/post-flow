import { prisma } from '@/lib/db/prisma'
import { requireCurrentUser } from '@/lib/auth/current-user'
import { DEMO_USER, SEED_STATE } from '@/lib/mock/seed'
import type {
  AccountStatus,
  ContentDraft,
  DemoState,
  DraftImage,
  DraftVersion,
  Platform,
  PlatformAccount,
  PlatformVariant,
  PublishJob,
  PublishJobStatus,
  PublishMode,
  User,
} from '@/types'

export const DEMO_USER_ID = 'user_demo'

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function toIso(date: Date | null | undefined): string | undefined {
  return date ? date.toISOString() : undefined
}

export async function ensureDemoData() {
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: DEMO_USER.email,
      passwordHash: '',
      plan: DEMO_USER.plan,
      aiQuotaUsed: DEMO_USER.aiQuotaUsed,
      aiQuotaLimit: DEMO_USER.aiQuotaLimit,
      timezone: DEMO_USER.timezone,
      onboardingStep: DEMO_USER.onboardingStep,
      primaryPlatform: null,
      firstPublishAt: null,
    },
  })

  const draftCount = await prisma.contentDraft.count({ where: { userId: DEMO_USER_ID } })
  if (draftCount > 0) return

  for (const account of SEED_STATE.accounts) {
    await prisma.platformAccount.create({
      data: {
        id: account.id,
        userId: DEMO_USER_ID,
        platform: account.platform,
        nickname: account.nickname,
        avatarUrl: account.avatarUrl,
        status: account.status,
        errorMessage: account.errorMessage,
        lastHealthCheck: account.lastHealthCheck ? new Date(account.lastHealthCheck) : undefined,
        createdAt: new Date(account.createdAt),
      },
    })
  }

  for (const draft of SEED_STATE.drafts) {
    await prisma.contentDraft.create({
      data: {
        id: draft.id,
        userId: DEMO_USER_ID,
        topic: draft.topic,
        platformTargets: JSON.stringify(draft.platformTargets),
        masterTitle: draft.masterTitle,
        masterBody: draft.masterBody,
        masterTags: JSON.stringify(draft.masterTags),
        status: draft.status,
        referenceUrl: draft.referenceUrl,
        imagePrompt: draft.imagePrompt,
        selectedCoverByPlatform: JSON.stringify(draft.selectedCoverByPlatform),
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt),
      },
    })
  }

  for (const draft of SEED_STATE.drafts) {
    for (const version of draft.versions) {
      await createDraftVersion(draft.id, version)
    }
  }

  for (const variant of SEED_STATE.variants) {
    await upsertPlatformVariant(variant)
  }

  for (const image of SEED_STATE.images.filter((item) => item.draftId)) {
    await createDraftImage(image)
  }

  for (const job of SEED_STATE.publishJobs) {
    const variant = await prisma.platformVariant.findUnique({ where: { id: job.variantId } })
    const account = await prisma.platformAccount.findUnique({ where: { id: job.accountId } })
    const draft = await prisma.contentDraft.findUnique({ where: { id: job.draftId } })
    if (!variant || !account || !draft) continue

    await prisma.publishJob.create({
      data: {
        id: job.id,
        userId: DEMO_USER_ID,
        draftId: job.draftId,
        variantId: job.variantId,
        accountId: job.accountId,
        platform: job.platform,
        draftTitle: job.draftTitle,
        mode: job.mode,
        scheduledAt: job.scheduledAt ? new Date(job.scheduledAt) : undefined,
        status: job.status,
        platformUrl: job.platformUrl,
        errorCode: job.errorCode,
        errorMessage: job.errorMessage,
        retryCount: job.retryCount,
        createdAt: new Date(job.createdAt),
        completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
      },
    })
  }
}

export async function getCurrentUserId() {
  const user = await requireCurrentUser()
  return user.id
}

export async function getDemoState(): Promise<DemoState> {
  const userId = await getCurrentUserId()
  const [user, accounts, drafts, variants, images, publishJobs] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.platformAccount.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.contentDraft.findMany({
      where: { userId },
      include: { versions: { orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.platformVariant.findMany({
      where: { draft: { userId } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.draftImage.findMany({
      where: { draft: { userId } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.publishJob.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ])

  return {
    user: mapUser(user),
    accounts: accounts.map(mapAccount),
    drafts: drafts.map(mapDraft),
    variants: variants.map(mapVariant),
    images: images.map(mapImage),
    publishJobs: publishJobs.map(mapPublishJob),
  }
}

export async function createContentDraft(data: Partial<ContentDraft>) {
  const userId = await getCurrentUserId()
  const now = new Date()
  const draft = await prisma.contentDraft.create({
    data: {
      id: data.id ?? `draft_${Date.now()}`,
      userId,
      topic: data.topic ?? '',
      platformTargets: JSON.stringify(data.platformTargets ?? ['xhs']),
      masterTitle: data.masterTitle ?? '',
      masterBody: data.masterBody ?? '',
      masterTags: JSON.stringify(data.masterTags ?? []),
      status: data.status ?? 'draft',
      referenceUrl: data.referenceUrl,
      imagePrompt: data.imagePrompt,
      selectedCoverByPlatform: JSON.stringify(data.selectedCoverByPlatform ?? {}),
      createdAt: data.createdAt ? new Date(data.createdAt) : now,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : now,
    },
    include: { versions: true },
  })
  return mapDraft(draft)
}

export async function updateContentDraft(id: string, patch: Partial<ContentDraft>) {
  const userId = await getCurrentUserId()
  await prisma.contentDraft.findFirstOrThrow({ where: { id, userId } })
  const data: Record<string, unknown> = {}
  if (patch.topic !== undefined) data.topic = patch.topic
  if (patch.platformTargets !== undefined) data.platformTargets = JSON.stringify(patch.platformTargets)
  if (patch.masterTitle !== undefined) data.masterTitle = patch.masterTitle
  if (patch.masterBody !== undefined) data.masterBody = patch.masterBody
  if (patch.masterTags !== undefined) data.masterTags = JSON.stringify(patch.masterTags)
  if (patch.status !== undefined) data.status = patch.status
  if (patch.referenceUrl !== undefined) data.referenceUrl = patch.referenceUrl
  if (patch.imagePrompt !== undefined) data.imagePrompt = patch.imagePrompt
  if (patch.selectedCoverByPlatform !== undefined) {
    data.selectedCoverByPlatform = JSON.stringify(patch.selectedCoverByPlatform)
  }

  const draft = await prisma.contentDraft.update({
    where: { id },
    data,
    include: { versions: { orderBy: { createdAt: 'desc' } } },
  })
  return mapDraft(draft)
}

export async function deleteContentDraft(id: string) {
  const userId = await getCurrentUserId()
  await prisma.contentDraft.findFirstOrThrow({ where: { id, userId } })
  await prisma.contentDraft.delete({ where: { id } })
}

export async function createDraftVersion(
  draftId: string,
  version: Omit<DraftVersion, 'id' | 'draftId' | 'createdAt'> | DraftVersion
) {
  const userId = await getCurrentUserId()
  await prisma.contentDraft.findFirstOrThrow({ where: { id: draftId, userId } })
  const created = await prisma.draftVersion.create({
    data: {
      id: 'id' in version ? version.id : `ver_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      draftId,
      title: version.title,
      body: version.body,
      tags: JSON.stringify(version.tags),
      source: version.source,
      createdAt: 'createdAt' in version ? new Date(version.createdAt) : undefined,
    },
  })
  return mapVersion(created)
}

export async function getDraftVersions(draftId: string) {
  const userId = await getCurrentUserId()
  await prisma.contentDraft.findFirstOrThrow({ where: { id: draftId, userId } })
  const versions = await prisma.draftVersion.findMany({
    where: { draftId },
    orderBy: { createdAt: 'desc' },
  })
  return versions.map(mapVersion)
}

export async function upsertPlatformVariant(variant: PlatformVariant) {
  const userId = await getCurrentUserId()
  await prisma.contentDraft.findFirstOrThrow({ where: { id: variant.draftId, userId } })
  const saved = await prisma.platformVariant.upsert({
    where: {
      draftId_platform: {
        draftId: variant.draftId,
        platform: variant.platform,
      },
    },
    update: {
      title: variant.title,
      body: variant.body,
      bodyHtml: variant.bodyHtml,
      tags: JSON.stringify(variant.tags),
      coverImageId: variant.coverImageId,
    },
    create: {
      id: variant.id,
      draftId: variant.draftId,
      platform: variant.platform,
      title: variant.title,
      body: variant.body,
      bodyHtml: variant.bodyHtml,
      tags: JSON.stringify(variant.tags),
      coverImageId: variant.coverImageId,
      createdAt: new Date(variant.createdAt),
      updatedAt: new Date(variant.updatedAt),
    },
  })
  return mapVariant(saved)
}

export async function updatePlatformVariant(id: string, patch: Partial<PlatformVariant>) {
  const userId = await getCurrentUserId()
  await prisma.platformVariant.findFirstOrThrow({ where: { id, draft: { userId } } })
  const data: Record<string, unknown> = {}
  if (patch.title !== undefined) data.title = patch.title
  if (patch.body !== undefined) data.body = patch.body
  if (patch.bodyHtml !== undefined) data.bodyHtml = patch.bodyHtml
  if (patch.tags !== undefined) data.tags = JSON.stringify(patch.tags)
  if (patch.coverImageId !== undefined) data.coverImageId = patch.coverImageId
  const variant = await prisma.platformVariant.update({ where: { id }, data })
  return mapVariant(variant)
}

export async function createDraftImage(image: Omit<DraftImage, 'id' | 'createdAt'> | DraftImage) {
  const userId = await getCurrentUserId()
  await prisma.contentDraft.findFirstOrThrow({ where: { id: image.draftId, userId } })
  const created = await prisma.draftImage.create({
    data: {
      id: 'id' in image ? image.id : `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      draftId: image.draftId,
      url: image.url,
      width: image.width,
      height: image.height,
      role: image.role,
      source: image.source,
      prompt: image.prompt,
      platform: image.platform,
      createdAt: 'createdAt' in image ? new Date(image.createdAt) : undefined,
    },
  })
  return mapImage(created)
}

export async function getDraftImages(draftId: string) {
  const userId = await getCurrentUserId()
  await prisma.contentDraft.findFirstOrThrow({ where: { id: draftId, userId } })
  const images = await prisma.draftImage.findMany({
    where: { draftId },
    orderBy: { createdAt: 'asc' },
  })
  return images.map(mapImage)
}

export async function selectDraftCover(
  draftId: string,
  imageId: string,
  platform: Platform,
  selectedCoverByPlatform?: Partial<Record<Platform, string>>
) {
  const userId = await getCurrentUserId()
  const [draft, image] = await Promise.all([
    prisma.contentDraft.findFirstOrThrow({ where: { id: draftId, userId } }),
    prisma.draftImage.findFirstOrThrow({ where: { id: imageId, draftId, draft: { userId } } }),
  ])
  const current = parseJson<Partial<Record<Platform, string>>>(draft.selectedCoverByPlatform, {})
  const next = {
    ...current,
    ...(selectedCoverByPlatform ?? {}),
    [platform]: image.id,
  }
  const updated = await prisma.contentDraft.update({
    where: { id: draftId },
    data: { selectedCoverByPlatform: JSON.stringify(next) },
    include: { versions: { orderBy: { createdAt: 'desc' } } },
  })
  return mapDraft(updated)
}

export async function createPlatformAccount(platform: Platform, seed?: PlatformAccount) {
  const userId = await getCurrentUserId()
  const now = new Date()
  const account = await prisma.platformAccount.create({
    data: {
      id: seed?.id ?? `acc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId,
      platform,
      nickname: seed?.nickname ?? (platform === 'xhs' ? '新连接的小红书号' : '新连接的公众号'),
      avatarUrl: seed?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${platform}_${Date.now()}`,
      status: seed?.status ?? 'active',
      errorMessage: seed?.errorMessage,
      lastHealthCheck: seed?.lastHealthCheck ? new Date(seed.lastHealthCheck) : now,
      createdAt: seed?.createdAt ? new Date(seed.createdAt) : now,
    },
  })
  return mapAccount(account)
}

export async function deletePlatformAccount(id: string) {
  const userId = await getCurrentUserId()
  await prisma.platformAccount.findFirstOrThrow({ where: { id, userId } })
  await prisma.platformAccount.delete({ where: { id } })
}

export async function refreshPlatformAccount(id: string) {
  const userId = await getCurrentUserId()
  await prisma.platformAccount.findFirstOrThrow({ where: { id, userId } })
  const account = await prisma.platformAccount.update({
    where: { id },
    data: { status: 'active', errorMessage: null, lastHealthCheck: new Date() },
  })
  return mapAccount(account)
}

export async function createPublishJobs(
  jobs: (Omit<PublishJob, 'id' | 'createdAt' | 'retryCount'> | PublishJob)[]
) {
  const userId = await getCurrentUserId()
  const created: PublishJob[] = []
  for (const job of jobs) {
    const [draft, variant, account] = await Promise.all([
      prisma.contentDraft.findFirstOrThrow({ where: { id: job.draftId, userId } }),
      prisma.platformVariant.findFirstOrThrow({
        where: { id: job.variantId, draftId: job.draftId, draft: { userId } },
      }),
      prisma.platformAccount.findFirstOrThrow({ where: { id: job.accountId, userId } }),
    ])
    if (variant.platform !== job.platform || account.platform !== job.platform) {
      throw new Error('INVALID_PUBLISH_TARGET')
    }
    const saved = await prisma.publishJob.create({
      data: {
        id: 'id' in job ? job.id : `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        userId,
        draftId: draft.id,
        variantId: job.variantId,
        accountId: job.accountId,
        platform: job.platform,
        draftTitle: job.draftTitle,
        mode: job.mode,
        scheduledAt: job.scheduledAt ? new Date(job.scheduledAt) : undefined,
        status: job.status,
        platformUrl: job.platformUrl,
        errorCode: job.errorCode,
        errorMessage: job.errorMessage,
        retryCount: 'retryCount' in job ? job.retryCount : 0,
        createdAt: 'createdAt' in job ? new Date(job.createdAt) : undefined,
        completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
      },
    })
    created.push(mapPublishJob(saved))
  }
  return created
}

export async function getPublishJob(id: string) {
  const userId = await getCurrentUserId()
  const job = await prisma.publishJob.findFirst({ where: { id, userId } })
  return job ? mapPublishJob(job) : null
}

export async function getQueueJobs() {
  const userId = await getCurrentUserId()
  const jobs = await prisma.publishJob.findMany({
    where: {
      userId,
      mode: 'scheduled',
      status: { in: ['queued', 'running'] },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  return jobs.map(mapPublishJob)
}

export async function getPublishLogs() {
  const userId = await getCurrentUserId()
  const jobs = await prisma.publishJob.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return jobs.map(mapPublishJob)
}

export async function updateDemoUser(patch: Partial<User>) {
  const userId = await getCurrentUserId()
  const data: Record<string, unknown> = {}
  if (patch.plan !== undefined) data.plan = patch.plan
  if (patch.aiQuotaUsed !== undefined) data.aiQuotaUsed = patch.aiQuotaUsed
  if (patch.aiQuotaLimit !== undefined) data.aiQuotaLimit = patch.aiQuotaLimit
  if (patch.timezone !== undefined) data.timezone = patch.timezone
  if (patch.onboardingStep !== undefined) data.onboardingStep = patch.onboardingStep
  if (patch.primaryPlatform !== undefined) data.primaryPlatform = patch.primaryPlatform
  if (patch.firstPublishAt !== undefined) data.firstPublishAt = patch.firstPublishAt ? new Date(patch.firstPublishAt) : null
  const user = await prisma.user.update({ where: { id: userId }, data })
  return mapUser(user)
}

export async function consumeUserAiQuota(cost: number) {
  const user = await requireCurrentUser()
  const result = await prisma.user.updateMany({
    where: {
      id: user.id,
      aiQuotaUsed: { lte: user.aiQuotaLimit - cost },
    },
    data: {
      aiQuotaUsed: { increment: cost },
    },
  })

  if (result.count === 0) {
    return null
  }

  const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
  return mapUser(updated)
}

export async function updatePublishJob(id: string, patch: Partial<PublishJob>) {
  const userId = await getCurrentUserId()
  await prisma.publishJob.findFirstOrThrow({ where: { id, userId } })
  const data: Record<string, unknown> = {}
  if (patch.mode !== undefined) data.mode = patch.mode
  if (patch.scheduledAt !== undefined) data.scheduledAt = patch.scheduledAt ? new Date(patch.scheduledAt) : null
  if (patch.status !== undefined) data.status = patch.status
  if (patch.platformUrl !== undefined) data.platformUrl = patch.platformUrl
  if (patch.errorCode !== undefined) data.errorCode = patch.errorCode
  if (patch.errorMessage !== undefined) data.errorMessage = patch.errorMessage
  if (patch.retryCount !== undefined) data.retryCount = patch.retryCount
  if (patch.completedAt !== undefined) data.completedAt = patch.completedAt ? new Date(patch.completedAt) : null
  const job = await prisma.publishJob.update({ where: { id }, data })
  return mapPublishJob(job)
}

export async function simulatePublishJob(id: string) {
  const userId = await getCurrentUserId()
  const current = await prisma.publishJob.findFirstOrThrow({ where: { id, userId } })
  const running = await prisma.publishJob.update({
    where: { id },
    data: {
      mode: 'immediate',
      scheduledAt: null,
      status: 'running',
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 2000))

  const completed = await prisma.publishJob.update({
    where: { id: running.id },
    data: {
      status: 'succeeded',
      platformUrl: buildMockPlatformUrl(current.platform as Platform),
      completedAt: new Date(),
    },
  })

  return mapPublishJob(completed)
}

function buildMockPlatformUrl(platform: Platform) {
  const suffix = Math.random().toString(36).slice(2, 10)
  return platform === 'xhs'
    ? `https://www.xiaohongshu.com/explore/${suffix}`
    : `https://mp.weixin.qq.com/s/${suffix}`
}

function mapUser(user: {
  email: string
  isAdmin?: boolean
  plan: string
  aiQuotaUsed: number
  aiQuotaLimit: number
  timezone: string
  onboardingStep: number
  primaryPlatform: string | null
  firstPublishAt: Date | null
}): User {
  return {
    email: user.email,
    isAdmin: user.isAdmin ?? false,
    plan: user.plan as User['plan'],
    aiQuotaUsed: user.aiQuotaUsed,
    aiQuotaLimit: user.aiQuotaLimit,
    timezone: user.timezone,
    onboardingStep: user.onboardingStep,
    primaryPlatform: (user.primaryPlatform ?? undefined) as Platform | undefined,
    firstPublishAt: toIso(user.firstPublishAt),
    isLoggedIn: true,
  }
}

function mapAccount(account: {
  id: string
  platform: string
  nickname: string
  avatarUrl: string
  status: string
  errorMessage: string | null
  lastHealthCheck: Date | null
  createdAt: Date
}): PlatformAccount {
  return {
    id: account.id,
    platform: account.platform as Platform,
    nickname: account.nickname,
    avatarUrl: account.avatarUrl,
    status: account.status as AccountStatus,
    errorMessage: account.errorMessage ?? undefined,
    lastHealthCheck: toIso(account.lastHealthCheck),
    createdAt: account.createdAt.toISOString(),
  }
}

function mapDraft(draft: {
  id: string
  topic: string
  platformTargets: string
  masterTitle: string
  masterBody: string
  masterTags: string
  status: string
  referenceUrl: string | null
  imagePrompt: string | null
  selectedCoverByPlatform: string
  versions?: Array<{
    id: string
    draftId: string
    title: string
    body: string
    tags: string
    source: string
    createdAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}): ContentDraft {
  return {
    id: draft.id,
    topic: draft.topic,
    platformTargets: parseJson<Platform[]>(draft.platformTargets, ['xhs']),
    masterTitle: draft.masterTitle,
    masterBody: draft.masterBody,
    masterTags: parseJson<string[]>(draft.masterTags, []),
    status: draft.status as ContentDraft['status'],
    referenceUrl: draft.referenceUrl ?? undefined,
    imagePrompt: draft.imagePrompt ?? undefined,
    selectedCoverByPlatform: parseJson<Partial<Record<Platform, string>>>(draft.selectedCoverByPlatform, {}),
    versions: (draft.versions ?? []).map(mapVersion),
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  }
}

function mapVersion(version: {
  id: string
  draftId: string
  title: string
  body: string
  tags: string
  source: string
  createdAt: Date
}): DraftVersion {
  return {
    id: version.id,
    draftId: version.draftId,
    title: version.title,
    body: version.body,
    tags: parseJson<string[]>(version.tags, []),
    source: version.source as DraftVersion['source'],
    createdAt: version.createdAt.toISOString(),
  }
}

function mapVariant(variant: {
  id: string
  draftId: string
  platform: string
  title: string
  body: string
  bodyHtml: string | null
  tags: string
  coverImageId: string | null
  createdAt: Date
  updatedAt: Date
}): PlatformVariant {
  return {
    id: variant.id,
    draftId: variant.draftId,
    platform: variant.platform as Platform,
    title: variant.title,
    body: variant.body,
    bodyHtml: variant.bodyHtml ?? undefined,
    tags: parseJson<string[]>(variant.tags, []),
    coverImageId: variant.coverImageId ?? undefined,
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  }
}

function mapImage(image: {
  id: string
  draftId: string
  url: string
  width: number
  height: number
  role: string
  source: string
  prompt: string | null
  platform: string | null
  createdAt: Date
}): DraftImage {
  return {
    id: image.id,
    draftId: image.draftId,
    url: image.url,
    width: image.width,
    height: image.height,
    role: image.role as DraftImage['role'],
    source: image.source as DraftImage['source'],
    prompt: image.prompt ?? undefined,
    platform: (image.platform ?? undefined) as Platform | undefined,
    createdAt: image.createdAt.toISOString(),
  }
}

function mapPublishJob(job: {
  id: string
  draftId: string
  variantId: string
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
}): PublishJob {
  return {
    id: job.id,
    draftId: job.draftId,
    variantId: job.variantId,
    accountId: job.accountId,
    platform: job.platform as Platform,
    draftTitle: job.draftTitle,
    mode: job.mode as PublishMode,
    scheduledAt: toIso(job.scheduledAt),
    status: job.status as PublishJobStatus,
    platformUrl: job.platformUrl ?? undefined,
    errorCode: job.errorCode ?? undefined,
    errorMessage: job.errorMessage ?? undefined,
    retryCount: job.retryCount,
    createdAt: job.createdAt.toISOString(),
    completedAt: toIso(job.completedAt),
  }
}
