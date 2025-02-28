import { searchQuery } from '@/lib/qdrant'
import { NextResponse } from 'next/server'



export async function POST(request: Request) {
  const {
    collectionName,
    vector,
    topK,
  }: {
    collectionName: string
    vector: number[]
    topK?: number
  } = await request.json()
  // console.log(collectionName, vector)
  try {
    const response = await searchQuery(collectionName, vector,topK)
    return NextResponse.json({ data: response })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
