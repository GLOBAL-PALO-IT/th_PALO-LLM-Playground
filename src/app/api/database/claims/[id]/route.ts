import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const claim = await prisma.claim.findUnique({ where: { id: params.id } })
  return claim
    ? NextResponse.json(claim)
    : NextResponse.json({ error: 'Claim not found' }, { status: 404 })
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json()
  const updatedClaim = await prisma.claim.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(updatedClaim)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.claim.delete({ where: { id: params.id } })
  return NextResponse.json({}, { status: 204 })
}
