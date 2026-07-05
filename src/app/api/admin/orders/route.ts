import { NextRequest, NextResponse } from 'next/server'
import { authRouteErrorResponse } from '@/lib/auth/current-user'
import { createAdminOrder, listAdminOrders } from '@/lib/admin/data'

export async function GET() {
  try {
    return NextResponse.json(await listAdminOrders())
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const amount = Math.round(Number(body.amount))
    if (!body.userId || !body.productType || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: '订单参数不完整' }, { status: 400 })
    }
    return NextResponse.json(
      await createAdminOrder({
        userId: String(body.userId),
        productType: String(body.productType),
        plan: body.plan ? String(body.plan) : undefined,
        amount,
        channel: body.channel ? String(body.channel) : undefined,
      }),
      { status: 201 }
    )
  } catch (error) {
    return authRouteErrorResponse(error)
  }
}

