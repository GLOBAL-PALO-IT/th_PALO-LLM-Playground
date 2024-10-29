import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const payments = await prisma.payment.findMany()
  return NextResponse.json(payments)
}

export async function POST(req: Request) {
  const data = await req.json()
  const newPayment = await prisma.payment.create({ data })
  return NextResponse.json(newPayment, { status: 201 })
}
