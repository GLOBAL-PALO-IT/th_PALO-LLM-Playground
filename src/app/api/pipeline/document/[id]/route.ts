import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pipeline/document/[id]
 * Get a specific document pipeline by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.documentPipeline.findUnique({
      where: { id: params.id },
      include: {
        TranslationPipeline: true,
        EnrichmentPipeline: true,
        EvaluationPipeline: true
      }
    })
    
    return document
      ? NextResponse.json(document)
      : NextResponse.json({ error: 'Document not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pipeline/document/[id]
 * Update a document pipeline
 * 
 * Request body:
 * {
 *   fileName?: string,
 *   content?: Json,
 *   metadata?: Json
 * }
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const updatedDocument = await prisma.documentPipeline.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pipeline/document/[id]
 * Delete a document pipeline
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.documentPipeline.delete({ where: { id: params.id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
