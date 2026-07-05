'use client'

import { Sidebar } from './Sidebar'
import { useDemoStore } from '@/lib/store/DemoStoreContext'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { hydrated } = useDemoStore()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1">
        {hydrated ? (
          children
        ) : (
          <div className="flex min-h-screen items-center justify-center px-6 text-sm text-slate-500">
            <div className="rounded-3xl border border-rose-100 bg-white/80 px-6 py-5 shadow-lg backdrop-blur">
              正在加载工作区数据…
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
