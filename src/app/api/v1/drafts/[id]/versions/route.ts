import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { createDraftVersion, getDraftVersions } from '@/lib/db/persistence'
import type { DraftVersion } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const versions = await getDraftVersions(id)
    return NextResponse.json(versions)
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as Omit<DraftVersion, 'id' | 'draftId' | 'createdAt'>
    const version = await createDraftVersion(id, body)
    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}
