import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'PostFlow 创流 — AI 社媒图文创作与分发',
  description: 'AI 驱动的社媒图文创作与一键分发工作台 Demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
