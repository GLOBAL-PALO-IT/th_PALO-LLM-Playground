import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pipeline/document
 * Get all document pipelines
 */
export async function GET() {
  try {
    const documents = await prisma.documentPipeline.findMany()
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pipeline/document
 * Create a new document pipeline
 * 
 * Request body:
 * {
 *   fileName: string,
 *   content?: Json,
 *   metadata?: Json
 * }
 */
export async function POST(req: Request) {
  try {
    const data = await req.json()
    const newDocument = await prisma.documentPipeline.create({ data })
    return NextResponse.json(newDocument, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
