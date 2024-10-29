import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const policy = await prisma.policy.findUnique({ where: { id: params.id } })
  return policy
    ? NextResponse.json(policy)
    : NextResponse.json({ error: 'Policy not found' }, { status: 404 })
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json()
  const updatedPolicy = await prisma.policy.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(updatedPolicy)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.policy.delete({ where: { id: params.id } })
  return NextResponse.json({}, { status: 204 })
}
