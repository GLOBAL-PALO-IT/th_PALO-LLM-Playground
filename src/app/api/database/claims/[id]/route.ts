import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const claim = await prisma.claim.findUnique({ where: { id } })
  return claim
    ? NextResponse.json(claim)
    : NextResponse.json({ error: 'Claim not found' }, { status: 404 })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await req.json()
  const updatedClaim = await prisma.claim.update({
    where: { id },
    data,
  })
  return NextResponse.json(updatedClaim)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.claim.delete({ where: { id } })
  return NextResponse.json({}, { status: 204 })
}
