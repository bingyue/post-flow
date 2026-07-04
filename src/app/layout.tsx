import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PostFlow 创流 — AI 社媒图文创作与分发',
  description: 'AI 驱动的社媒图文创作与一键分发工作台 Demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${geist.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
