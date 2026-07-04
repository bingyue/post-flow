'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { useDemoStore } from '@/lib/store/DemoStoreContext'

export default function RegisterPage() {
  const { login } = useDemoStore()
  const router = useRouter()

  const handleRegister = () => {
    login('newuser@postflow.app')
    router.push('/onboarding')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">注册 PostFlow</h1>
          <p className="mt-2 text-sm text-slate-500">免费版含 5 次 AI 创作额度</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>邮箱</Label>
            <Input placeholder="you@example.com" />
          </div>
          <div>
            <Label>密码</Label>
            <Input type="password" />
          </div>
          <Button className="w-full" onClick={handleRegister}>
            注册并进入引导
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          已有账号？{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
