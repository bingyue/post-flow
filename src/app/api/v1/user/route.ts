import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { updateDemoUser } from '@/lib/db/persistence'
import type { User } from '@/types'

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<User>
    const user = await updateDemoUser(body)
    return NextResponse.json(user)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
