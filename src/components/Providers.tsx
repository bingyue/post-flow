'use client'

import { DemoStoreProvider } from '@/lib/store/DemoStoreContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <DemoStoreProvider>{children}</DemoStoreProvider>
}
