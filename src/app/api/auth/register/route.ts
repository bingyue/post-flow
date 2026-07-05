import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { prisma } from '@/lib/db/prisma'

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isAdminEmail(email: string) {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email)
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    email?: string
    password?: string
  } | null

  const email = body?.email?.trim().toLowerCase() ?? ''
  const password = body?.password ?? ''

  if (!isEmail(email)) {
    return NextResponse.json({ error: '请输入有效邮箱' }, { status: 400 })
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 })
  }

  try {
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        passwordHash: await hashPassword(password),
        isAdmin: isAdminEmail(email),
      },
      select: {
        id: true,
        email: true,
        plan: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: '该邮箱已注册，请直接登录' }, { status: 409 })
    }

    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}
