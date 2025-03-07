import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pipeline/translation/[id]
 * Get a specific translation pipeline by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const translation = await prisma.translationPipeline.findUnique({
      where: { id: params.id },
      include: {
        document: true
      }
    })
    
    return translation
      ? NextResponse.json(translation)
      : NextResponse.json({ error: 'Translation not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching translation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translation' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pipeline/translation/[id]
 * Update a translation pipeline
 * 
 * Request body:
 * {
 *   fileName?: string,
 *   page?: number,
 *   input?: string,
 *   output?: string,
 *   metadata?: Json
 * }
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const updatedTranslation = await prisma.translationPipeline.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(updatedTranslation)
  } catch (error) {
    console.error('Error updating translation:', error)
    return NextResponse.json(
      { error: 'Failed to update translation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pipeline/translation/[id]
 * Delete a translation pipeline
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.translationPipeline.delete({ where: { id: params.id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    console.error('Error deleting translation:', error)
    return NextResponse.json(
      { error: 'Failed to delete translation' },
      { status: 500 }
    )
  }
}
