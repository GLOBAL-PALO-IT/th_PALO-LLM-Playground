import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const claims = await prisma.claim.findMany()
  return NextResponse.json(claims)
}

export async function POST(req: Request) {
  const data = await req.json()
  const newClaim = await prisma.claim.create({ data })
  return NextResponse.json(newClaim, { status: 201 })
}

// `claim/[id]/route.ts` for individual claim routes
