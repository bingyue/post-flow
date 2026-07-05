import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { createContentDraft, getDemoState } from '@/lib/db/persistence'
import type { ContentDraft } from '@/types'

export async function GET() {
  try {
    const state = await getDemoState()
    return NextResponse.json(state.drafts)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ContentDraft>
    const draft = await createContentDraft(body)
    return NextResponse.json(draft, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
