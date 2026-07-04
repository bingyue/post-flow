'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { addDays, isWithinInterval, parseISO } from 'date-fns'
import { DEMO_USER, SEED_STATE } from '@/lib/mock/seed'
import { generateId } from '@/lib/utils'
import type {
  ContentDraft,
  DemoState,
  DraftImage,
  Platform,
  PlatformAccount,
  PlatformVariant,
  PublishJob,
  PublishJobStatus,
  PublishMode,
  User,
} from '@/types'

const STORAGE_KEY = 'postflow-demo-state'

interface DemoStoreContextValue extends DemoState {
  hydrated: boolean
  login: (email?: string) => void
  logout: () => void
  resetDemo: () => void
  updateUser: (patch: Partial<User>) => void
  createDraft: (data: Partial<ContentDraft>) => ContentDraft
  updateDraft: (id: string, patch: Partial<ContentDraft>) => void
  deleteDraft: (id: string) => void
  addDraftVersion: (draftId: string, version: Omit<ContentDraft['versions'][0], 'id' | 'draftId' | 'createdAt'>) => void
  upsertVariant: (variant: PlatformVariant) => void
  updateVariant: (id: string, patch: Partial<PlatformVariant>) => void
  addImage: (image: Omit<DraftImage, 'id' | 'createdAt'>) => DraftImage
  updateImage: (id: string, patch: Partial<DraftImage>) => void
  connectAccount: (platform: Platform) => PlatformAccount
  disconnectAccount: (id: string) => void
  refreshAccount: (id: string) => void
  createPublishJobs: (jobs: Omit<PublishJob, 'id' | 'createdAt' | 'retryCount'>[]) => PublishJob[]
  updatePublishJob: (id: string, patch: Partial<PublishJob>) => void
  consumeAiQuota: (amount?: number) => boolean
  readyDrafts: ContentDraft[]
  upcomingQueue: PublishJob[]
  recentLogs: PublishJob[]
  expiredAccounts: PlatformAccount[]
}

const DemoStoreContext = createContext<DemoStoreContextValue | null>(null)

function loadState(): DemoState {
  if (typeof window === 'undefined') return SEED_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_STATE
    return { ...SEED_STATE, ...JSON.parse(raw) } as DemoState
  } catch {
    return SEED_STATE
  }
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(SEED_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const login = useCallback((email?: string) => {
    setState((s) => ({
      ...s,
      user: { ...DEMO_USER, email: email ?? DEMO_USER.email, isLoggedIn: true },
    }))
  }, [])

  const logout = useCallback(() => {
    setState((s) => ({ ...s, user: null }))
  }, [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ ...SEED_STATE, user: state.user })
  }, [state.user])

  const updateUser = useCallback((patch: Partial<User>) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s))
  }, [])

  const createDraft = useCallback((data: Partial<ContentDraft>) => {
    const draft: ContentDraft = {
      id: generateId('draft'),
      topic: data.topic ?? '',
      platformTargets: data.platformTargets ?? ['xhs'],
      masterTitle: data.masterTitle ?? '',
      masterBody: data.masterBody ?? '',
      masterTags: data.masterTags ?? [],
      status: 'draft',
      referenceUrl: data.referenceUrl,
      imagePrompt: data.imagePrompt,
      selectedCoverByPlatform: {},
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, drafts: [draft, ...s.drafts] }))
    return draft
  }, [])

  const updateDraft = useCallback((id: string, patch: Partial<ContentDraft>) => {
    setState((s) => ({
      ...s,
      drafts: s.drafts.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d
      ),
    }))
  }, [])

  const deleteDraft = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      drafts: s.drafts.filter((d) => d.id !== id),
      variants: s.variants.filter((v) => v.draftId !== id),
      images: s.images.filter((i) => i.draftId !== id),
    }))
  }, [])

  const addDraftVersion = useCallback(
    (draftId: string, version: Omit<ContentDraft['versions'][0], 'id' | 'draftId' | 'createdAt'>) => {
      const v = {
        ...version,
        id: generateId('ver'),
        draftId,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({
        ...s,
        drafts: s.drafts.map((d) =>
          d.id === draftId
            ? { ...d, versions: [v, ...d.versions].slice(0, 20), updatedAt: new Date().toISOString() }
            : d
        ),
      }))
    },
    []
  )

  const upsertVariant = useCallback((variant: PlatformVariant) => {
    setState((s) => {
      const exists = s.variants.find((v) => v.id === variant.id)
      if (exists) {
        return {
          ...s,
          variants: s.variants.map((v) => (v.id === variant.id ? variant : v)),
        }
      }
      return { ...s, variants: [...s.variants, variant] }
    })
  }, [])

  const updateVariant = useCallback((id: string, patch: Partial<PlatformVariant>) => {
    setState((s) => ({
      ...s,
      variants: s.variants.map((v) =>
        v.id === id ? { ...v, ...patch, updatedAt: new Date().toISOString() } : v
      ),
    }))
  }, [])

  const addImage = useCallback((image: Omit<DraftImage, 'id' | 'createdAt'>) => {
    const img: DraftImage = {
      ...image,
      id: generateId('img'),
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, images: [...s.images, img] }))
    return img
  }, [])

  const updateImage = useCallback((id: string, patch: Partial<DraftImage>) => {
    setState((s) => ({
      ...s,
      images: s.images.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }))
  }, [])

  const connectAccount = useCallback((platform: Platform) => {
    const account: PlatformAccount = {
      id: generateId('acc'),
      platform,
      nickname: platform === 'xhs' ? '新连接的小红书号' : '新连接的公众号',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${platform}_${Date.now()}`,
      status: 'active',
      lastHealthCheck: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, accounts: [...s.accounts, account] }))
    return account
  }, [])

  const disconnectAccount = useCallback((id: string) => {
    setState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }))
  }, [])

  const refreshAccount = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) =>
        a.id === id
          ? { ...a, status: 'active', errorMessage: undefined, lastHealthCheck: new Date().toISOString() }
          : a
      ),
    }))
  }, [])

  const createPublishJobs = useCallback(
    (jobs: Omit<PublishJob, 'id' | 'createdAt' | 'retryCount'>[]) => {
      const created = jobs.map((j) => ({
        ...j,
        id: generateId('job'),
        retryCount: 0,
        createdAt: new Date().toISOString(),
      }))
      setState((s) => ({ ...s, publishJobs: [...created, ...s.publishJobs] }))
      return created
    },
    []
  )

  const updatePublishJob = useCallback((id: string, patch: Partial<PublishJob>) => {
    setState((s) => ({
      ...s,
      publishJobs: s.publishJobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    }))
  }, [])

  const consumeAiQuota = useCallback((amount = 1) => {
    let allowed = false
    setState((s) => {
      if (!s.user || s.user.aiQuotaUsed + amount > s.user.aiQuotaLimit) return s
      allowed = true
      return {
        ...s,
        user: { ...s.user, aiQuotaUsed: Math.min(s.user.aiQuotaLimit, s.user.aiQuotaUsed + amount) },
      }
    })
    return allowed
  }, [])

  const readyDrafts = useMemo(
    () => state.drafts.filter((d) => d.status === 'ready').slice(0, 5),
    [state.drafts]
  )

  const upcomingQueue = useMemo(() => {
    const end = addDays(new Date(), 7)
    return state.publishJobs
      .filter(
        (j) =>
          j.mode === 'scheduled' &&
          j.status === 'queued' &&
          j.scheduledAt &&
          isWithinInterval(parseISO(j.scheduledAt), { start: new Date(), end })
      )
      .sort((a, b) => (a.scheduledAt! > b.scheduledAt! ? 1 : -1))
  }, [state.publishJobs])

  const recentLogs = useMemo(
    () =>
      [...state.publishJobs]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 10),
    [state.publishJobs]
  )

  const expiredAccounts = useMemo(
    () => state.accounts.filter((a) => a.status === 'expired' || a.status === 'error'),
    [state.accounts]
  )

  const value: DemoStoreContextValue = {
    ...state,
    hydrated,
    login,
    logout,
    resetDemo,
    updateUser,
    createDraft,
    updateDraft,
    deleteDraft,
    addDraftVersion,
    upsertVariant,
    updateVariant,
    addImage,
    updateImage,
    connectAccount,
    disconnectAccount,
    refreshAccount,
    createPublishJobs,
    updatePublishJob,
    consumeAiQuota,
    readyDrafts,
    upcomingQueue,
    recentLogs,
    expiredAccounts,
  }

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext)
  if (!ctx) throw new Error('useDemoStore must be used within DemoStoreProvider')
  return ctx
}

export function simulatePublish(
  jobId: string,
  platform: Platform,
  update: (id: string, patch: Partial<PublishJob>) => void,
  onSuccess?: () => void
) {
  update(jobId, { status: 'running' as PublishJobStatus })
  setTimeout(() => {
    const platformUrl =
      platform === 'xhs'
        ? 'https://www.xiaohongshu.com/explore/' + Math.random().toString(36).slice(2, 10)
        : 'https://mp.weixin.qq.com/s/' + Math.random().toString(36).slice(2, 10)
    update(jobId, {
      status: 'succeeded',
      platformUrl,
      completedAt: new Date().toISOString(),
    })
    onSuccess?.()
  }, 2000)
}

export type { PublishMode }
