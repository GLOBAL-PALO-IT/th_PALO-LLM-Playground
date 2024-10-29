import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
/**Frontend Code
await fetch('/api/database/clients', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
})
 */
export async function GET() {
  const clients = await prisma.client.findMany()
  return NextResponse.json(clients)
}
/**Frontend Code
await fetch('/api/database/clients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John Doe' }),
})
 */
export async function POST(req: Request) {
  const data = await req.json()
  const newClient = await prisma.client.create({ data })
  return NextResponse.json(newClient, { status: 201 })
}
