import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'

export async function getCurrentUser() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isAdmin: true,
      plan: true,
      aiQuotaUsed: true,
      aiQuotaLimit: true,
      timezone: true,
      onboardingStep: true,
      primaryPlatform: true,
      firstPublishAt: true,
    },
  })
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('UNAUTHORIZED')
  }

  return user
}

export async function requireAdminUser() {
  const user = await requireCurrentUser()

  if (!user.isAdmin) {
    throw new Error('FORBIDDEN')
  }

  return user
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: '请先登录后再继续操作' }, { status: 401 })
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.message === 'UNAUTHORIZED'
}

export function authRouteErrorResponse(error: unknown) {
  if (isUnauthorizedError(error)) {
    return unauthorizedResponse()
  }

  if (error instanceof Error && error.message === 'FORBIDDEN') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return NextResponse.json({ error: '资源不存在或无权访问' }, { status: 404 })
  }

  if (error instanceof Error && error.message === 'INVALID_PUBLISH_TARGET') {
    return NextResponse.json({ error: '发布目标不属于当前用户或平台不匹配' }, { status: 400 })
  }

  console.error(error)
  return NextResponse.json({ error: '服务异常，请稍后重试' }, { status: 500 })
}
