'use client'

import { Sidebar } from './Sidebar'
import { useDemoStore } from '@/lib/store/DemoStoreContext'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { hydrated } = useDemoStore()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {hydrated ? (
          children
        ) : (
          <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
            正在加载工作区数据…
          </div>
        )}
      </main>
    </div>
  )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
