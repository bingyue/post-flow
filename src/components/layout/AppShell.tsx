'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { useDemoStore } from '@/lib/store/DemoStoreContext'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useDemoStore()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return
    if (!user?.isLoggedIn) {
      router.replace('/login')
    }
  }, [hydrated, user, router])

  if (!hydrated || !user?.isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        加载中…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
