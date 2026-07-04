import Link from 'next/link'
import { Sparkles, PenLine, Send, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">PostFlow 创流</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="secondary">登录</Button>
          </Link>
          <Link href="/register">
            <Button>免费试用</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          AI 驱动的社媒图文
          <br />
          <span className="text-indigo-600">创作与一键分发</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          选题 → AI 写稿 → 配图 → 多平台适配 → 定时发布。将单篇图文产出从 2 小时压缩至 30 分钟。
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg">开始 Demo 体验</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              已有账号
            </Button>
          </Link>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3 text-left">
          {[
            { icon: PenLine, title: 'AI 辅助创作', desc: '小红书/公众号风格一键生成，支持改写扩写' },
            { icon: Layers, title: '平台原生适配', desc: '标题字数、标签、封面比例自动处理' },
            { icon: Send, title: '自动发布', desc: '连接账号，即时或定时发布到多平台' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Icon className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
