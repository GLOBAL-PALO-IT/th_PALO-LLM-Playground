import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
/**Frontend Code
await fetch('/api/database/clients/[id]', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: '1',
    }),
})
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const client = await prisma.client.findUnique({ where: { id: params.id } })
  return client
    ? NextResponse.json(client)
    : NextResponse.json({ error: 'Client not found' }, { status: 404 })
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json()
  const updatedClient = await prisma.client.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(updatedClient)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.client.delete({ where: { id: params.id } })
  return NextResponse.json({}, { status: 204 })
}
