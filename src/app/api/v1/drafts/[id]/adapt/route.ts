import { NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { adaptToPlatforms } from '@/lib/adapter'
import { getDemoState, upsertPlatformVariant } from '@/lib/db/persistence'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const state = await getDemoState()
    const draft = state.drafts.find((item) => item.id === id)

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    const variants = adaptToPlatforms(id, draft, draft.platformTargets)
    const saved = await Promise.all(variants.map((variant) => upsertPlatformVariant(variant)))
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
