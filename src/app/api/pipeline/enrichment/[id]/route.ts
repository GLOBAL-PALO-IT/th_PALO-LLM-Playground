import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pipeline/enrichment/[id]
 * Get a specific enrichment pipeline by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const enrichment = await prisma.enrichmentPipeline.findUnique({
      where: { id: params.id },
      include: {
        document: true
      }
    })
    
    return enrichment
      ? NextResponse.json(enrichment)
      : NextResponse.json({ error: 'Enrichment not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching enrichment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrichment' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pipeline/enrichment/[id]
 * Update an enrichment pipeline
 * 
 * Request body:
 * {
 *   fileName?: string,
 *   page?: number,
 *   input?: string,
 *   output?: Json,
 *   metadata?: Json
 * }
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const updatedEnrichment = await prisma.enrichmentPipeline.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(updatedEnrichment)
  } catch (error) {
    console.error('Error updating enrichment:', error)
    return NextResponse.json(
      { error: 'Failed to update enrichment' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pipeline/enrichment/[id]
 * Delete an enrichment pipeline
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.enrichmentPipeline.delete({ where: { id: params.id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    console.error('Error deleting enrichment:', error)
    return NextResponse.json(
      { error: 'Failed to delete enrichment' },
      { status: 500 }
    )
  }
}
