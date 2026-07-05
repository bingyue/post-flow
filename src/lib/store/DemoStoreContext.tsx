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
import { useSession } from 'next-auth/react'
import { addDays, isWithinInterval, parseISO } from 'date-fns'
import { DEMO_USER } from '@/lib/mock/seed'
import { generateId } from '@/lib/utils'
import type {
  ContentDraft,
  DemoState,
  DraftImage,
  Platform,
  PlatformAccount,
  PlatformVariant,
  PublishJob,
  PublishMode,
  User,
} from '@/types'

const STORAGE_KEY = 'postflow-demo-state'
const EMPTY_STATE: DemoState = {
  user: null,
  accounts: [],
  drafts: [],
  variants: [],
  images: [],
  publishJobs: [],
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
    if (!res.ok) throw new Error(await res.text())
    return (await res.json()) as T
  } catch (error) {
    console.warn('PostFlow persistence sync failed:', error)
    return null
  }
}

interface DemoStoreContextValue extends DemoState {
  hydrated: boolean
  login: (email?: string) => void
  logout: () => void
  resetDemo: () => void
  updateUser: (patch: Partial<User>) => void
  createDraft: (data: Partial<ContentDraft>) => ContentDraft
  updateDraft: (id: string, patch: Partial<ContentDraft>) => void
  deleteDraft: (id: string) => void
  addDraftVersion: (
    draftId: string,
    version:
      | Omit<ContentDraft['versions'][0], 'id' | 'draftId' | 'createdAt'>
      | ContentDraft['versions'][0]
  ) => void
  upsertVariant: (variant: PlatformVariant) => void
  updateVariant: (id: string, patch: Partial<PlatformVariant>) => void
  addImage: (image: Omit<DraftImage, 'id' | 'createdAt'> | DraftImage) => DraftImage
  updateImage: (id: string, patch: Partial<DraftImage>) => void
  connectAccount: (platform: Platform) => PlatformAccount
  disconnectAccount: (id: string) => void
  refreshAccount: (id: string) => void
  createPublishJobs: (jobs: (Omit<PublishJob, 'id' | 'createdAt' | 'retryCount'> | PublishJob)[]) => PublishJob[]
  updatePublishJob: (id: string, patch: Partial<PublishJob>) => void
  consumeAiQuota: (amount?: number) => boolean
  readyDrafts: ContentDraft[]
  upcomingQueue: PublishJob[]
  recentLogs: PublishJob[]
  expiredAccounts: PlatformAccount[]
}

const DemoStoreContext = createContext<DemoStoreContextValue | null>(null)

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [state, setState] = useState<DemoState>(EMPTY_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      localStorage.removeItem(STORAGE_KEY)
      setState(EMPTY_STATE)
      setHydrated(true)
      return
    }

    setHydrated(false)
    setState(EMPTY_STATE)
    void apiJson<DemoState>('/api/v1/bootstrap')
      .then((remoteState) => {
        setState(remoteState ?? EMPTY_STATE)
      })
      .finally(() => setHydrated(true))
  }, [status])

  useEffect(() => {
    if (!hydrated || status === 'authenticated') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated, status])

  const login = useCallback((email?: string) => {
    setState((s) => ({
      ...s,
      user: { ...DEMO_USER, email: email ?? DEMO_USER.email, isLoggedIn: true },
    }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState((s) => ({ ...s, user: null }))
  }, [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHydrated(false)
    void apiJson<DemoState>('/api/v1/bootstrap')
      .then((remoteState) => setState(remoteState ?? EMPTY_STATE))
      .finally(() => setHydrated(true))
  }, [])

  const updateUser = useCallback((patch: Partial<User>) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s))
    void apiJson<User>('/api/v1/user', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  }, [])

  const createDraft = useCallback((data: Partial<ContentDraft>) => {
    const isPersisted = Boolean(data.id)
    const draft: ContentDraft = {
      id: data.id ?? generateId('draft'),
      topic: data.topic ?? '',
      platformTargets: data.platformTargets ?? ['xhs'],
      masterTitle: data.masterTitle ?? '',
      masterBody: data.masterBody ?? '',
      masterTags: data.masterTags ?? [],
      status: data.status ?? 'draft',
      referenceUrl: data.referenceUrl,
      imagePrompt: data.imagePrompt,
      selectedCoverByPlatform: data.selectedCoverByPlatform ?? {},
      versions: data.versions ?? [],
      createdAt: data.createdAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    }
    setState((s) => ({ ...s, drafts: [draft, ...s.drafts] }))
    if (!isPersisted) {
      void apiJson<ContentDraft>('/api/v1/drafts', {
        method: 'POST',
        body: JSON.stringify(draft),
      })
    }
    return draft
  }, [])

  const updateDraft = useCallback((id: string, patch: Partial<ContentDraft>) => {
    setState((s) => ({
      ...s,
      drafts: s.drafts.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d
      ),
    }))
    void apiJson<ContentDraft>(`/api/v1/drafts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  }, [])

  const deleteDraft = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      drafts: s.drafts.filter((d) => d.id !== id),
      variants: s.variants.filter((v) => v.draftId !== id),
      images: s.images.filter((i) => i.draftId !== id),
    }))
    void apiJson<{ ok: boolean }>(`/api/v1/drafts/${id}`, { method: 'DELETE' })
  }, [])

  const addDraftVersion = useCallback(
    (
      draftId: string,
      version:
        | Omit<ContentDraft['versions'][0], 'id' | 'draftId' | 'createdAt'>
        | ContentDraft['versions'][0]
    ) => {
      const isPersisted = 'id' in version
      const v = isPersisted
        ? version
        : {
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
      if (!isPersisted) {
        void apiJson<ContentDraft['versions'][0]>(`/api/v1/drafts/${draftId}/versions`, {
          method: 'POST',
          body: JSON.stringify(v),
        })
      }
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
    void apiJson<PlatformVariant>('/api/v1/variants', {
      method: 'POST',
      body: JSON.stringify(variant),
    })
  }, [])

  const updateVariant = useCallback((id: string, patch: Partial<PlatformVariant>) => {
    setState((s) => ({
      ...s,
      variants: s.variants.map((v) =>
        v.id === id ? { ...v, ...patch, updatedAt: new Date().toISOString() } : v
      ),
    }))
    void apiJson<PlatformVariant>(`/api/v1/variants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  }, [])

  const addImage = useCallback((image: Omit<DraftImage, 'id' | 'createdAt'> | DraftImage) => {
    const isPersisted = 'id' in image
    const img: DraftImage = isPersisted
      ? image
      : {
          ...image,
          id: generateId('img'),
          createdAt: new Date().toISOString(),
        }
    setState((s) => ({ ...s, images: [...s.images, img] }))
    if (!isPersisted) {
      void apiJson<DraftImage>(`/api/v1/drafts/${image.draftId}/images`, {
        method: 'POST',
        body: JSON.stringify(img),
      })
    }
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
    void apiJson<PlatformAccount>('/api/v1/accounts/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, account }),
    })
    return account
  }, [])

  const disconnectAccount = useCallback((id: string) => {
    setState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }))
    void apiJson<{ ok: boolean }>(`/api/v1/accounts/${id}`, { method: 'DELETE' })
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
    void apiJson<PlatformAccount>(`/api/v1/accounts/${id}/refresh`, { method: 'POST' })
  }, [])

  const createPublishJobs = useCallback(
    ((jobs: (Omit<PublishJob, 'id' | 'createdAt' | 'retryCount'> | PublishJob)[]) => {
      const allPersisted = jobs.every((j) => 'id' in j && 'createdAt' in j && 'retryCount' in j)
      const created = jobs.map((j) =>
        'id' in j && 'createdAt' in j && 'retryCount' in j
          ? j
          : {
              ...j,
              id: generateId('job'),
              retryCount: 0,
              createdAt: new Date().toISOString(),
            }
      ) as PublishJob[]
      setState((s) => ({ ...s, publishJobs: [...created, ...s.publishJobs] }))
      if (!allPersisted) {
        void apiJson<PublishJob[]>('/api/v1/publish', {
          method: 'POST',
          body: JSON.stringify({ jobs: created }),
        })
      }
      return created
    }) as DemoStoreContextValue['createPublishJobs'],
    []
  )

  const updatePublishJob = useCallback((id: string, patch: Partial<PublishJob>) => {
    setState((s) => ({
      ...s,
      publishJobs: s.publishJobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    }))
    void apiJson<PublishJob>(`/api/v1/publish/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  }, [])

  const consumeAiQuota = useCallback((amount = 1) => {
    let allowed = false
    let nextAiQuotaUsed: number | null = null
    setState((s) => {
      if (!s.user || s.user.aiQuotaUsed + amount > s.user.aiQuotaLimit) return s
      allowed = true
      nextAiQuotaUsed = Math.min(s.user.aiQuotaLimit, s.user.aiQuotaUsed + amount)
      return {
        ...s,
        user: { ...s.user, aiQuotaUsed: nextAiQuotaUsed },
      }
    })
    if (nextAiQuotaUsed !== null) {
      void apiJson<User>('/api/v1/user', {
        method: 'PATCH',
        body: JSON.stringify({ aiQuotaUsed: nextAiQuotaUsed }),
      })
    }
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

export type { PublishMode }
