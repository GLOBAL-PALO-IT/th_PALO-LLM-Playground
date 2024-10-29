import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const policies = await prisma.policy.findMany()
  return NextResponse.json(policies)
}

export async function POST(req: Request) {
  const data = await req.json()
  const newPolicy = await prisma.policy.create({ data })
  return NextResponse.json(newPolicy, { status: 201 })
}
