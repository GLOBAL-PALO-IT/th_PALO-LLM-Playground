import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const payment = await prisma.payment.findUnique({ where: { id: params.id } })
  return payment
    ? NextResponse.json(payment)
    : NextResponse.json({ error: 'Payment not found' }, { status: 404 })
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json()
  const updatedPayment = await prisma.payment.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(updatedPayment)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.payment.delete({ where: { id: params.id } })
  return NextResponse.json({}, { status: 204 })
}
