export type Platform = 'xhs' | 'wechat_mp'

export type DraftStatus = 'draft' | 'ready' | 'publishing' | 'published' | 'archived'

export type AccountStatus = 'pending' | 'active' | 'expired' | 'error' | 'revoked'

export type PublishJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'retrying'
  | 'failed_final'
  | 'cancelled'

export type PublishMode = 'immediate' | 'scheduled'

export type GenerateAction = 'full' | 'rewrite' | 'shorten' | 'expand' | 'retitle'

export interface User {
  email: string
  plan: 'free' | 'creator' | 'pro' | 'team'
  aiQuotaUsed: number
  aiQuotaLimit: number
  timezone: string
  onboardingStep: number
  primaryPlatform?: Platform
  firstPublishAt?: string
  isLoggedIn: boolean
}

export interface PlatformAccount {
  id: string
  platform: Platform
  nickname: string
  avatarUrl: string
  status: AccountStatus
  errorMessage?: string
  lastHealthCheck?: string
  createdAt: string
}

export interface DraftVersion {
  id: string
  draftId: string
  title: string
  body: string
  tags: string[]
  source: 'ai_full' | 'ai_rewrite' | 'manual'
  createdAt: string
}

export interface DraftImage {
  id: string
  draftId: string
  url: string
  width: number
  height: number
  role: 'cover' | 'inline'
  source: 'ai' | 'mock' | 'upload'
  prompt?: string
  platform?: Platform
  createdAt: string
}

export interface PlatformVariant {
  id: string
  draftId: string
  platform: Platform
  title: string
  body: string
  bodyHtml?: string
  tags: string[]
  coverImageId?: string
  createdAt: string
  updatedAt: string
}

export interface ContentDraft {
  id: string
  topic: string
  platformTargets: Platform[]
  masterTitle: string
  masterBody: string
  masterTags: string[]
  status: DraftStatus
  referenceUrl?: string
  imagePrompt?: string
  selectedCoverByPlatform: Partial<Record<Platform, string>>
  versions: DraftVersion[]
  createdAt: string
  updatedAt: string
}

export interface PublishJob {
  id: string
  draftId: string
  variantId: string
  accountId: string
  platform: Platform
  draftTitle: string
  mode: PublishMode
  scheduledAt?: string
  status: PublishJobStatus
  platformUrl?: string
  errorCode?: string
  errorMessage?: string
  retryCount: number
  createdAt: string
  completedAt?: string
}

export interface DemoState {
  user: User | null
  accounts: PlatformAccount[]
  drafts: ContentDraft[]
  variants: PlatformVariant[]
  images: DraftImage[]
  publishJobs: PublishJob[]
}

export interface AiConfig {
  llmApiBase: string
  llmApiKey: string
  llmModel: string
  imageApiBase: string
  imageApiKey: string
  imageModel: string
}

export interface ComplianceIssue {
  type: 'forbidden_word' | 'ad_law_risk' | 'platform_rule' | 'length_exceeded'
  word?: string
  position?: number
  severity: 'error' | 'warning'
  suggestion?: string
  message: string
}

export interface ComplianceResult {
  passed: boolean
  issues: ComplianceIssue[]
}

export type StudioStep = 'edit' | 'images' | 'adapt' | 'preview' | 'publish'
