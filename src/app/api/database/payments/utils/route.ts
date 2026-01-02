import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  const payments = await prisma.payment.findMany({
    orderBy: {
      amount: 'desc',
    },
    take: 10,
  })
  return NextResponse.json(payments)
}
