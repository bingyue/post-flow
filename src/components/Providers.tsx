'use client'

import { SessionProvider } from 'next-auth/react'
import { DemoStoreProvider } from '@/lib/store/DemoStoreContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DemoStoreProvider>{children}</DemoStoreProvider>
    </SessionProvider>
  )
}
