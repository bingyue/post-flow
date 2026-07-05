import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { deleteContentDraft, updateContentDraft } from '@/lib/db/persistence'
import type { ContentDraft } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as Partial<ContentDraft>
    const draft = await updateContentDraft(id, body)
    return NextResponse.json(draft)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteContentDraft(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
