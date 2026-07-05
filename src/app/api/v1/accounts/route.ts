import { NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { getDemoState } from '@/lib/db/persistence'

export async function GET() {
  try {
    const state = await getDemoState()
    return NextResponse.json(state.accounts)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
