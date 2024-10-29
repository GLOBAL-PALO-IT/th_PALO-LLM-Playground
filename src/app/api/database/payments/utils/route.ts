import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const payments = await prisma.payment.findMany({
    orderBy: {
      amount: 'desc',
    },
    take: 10,
  })
  return NextResponse.json(payments)
}
