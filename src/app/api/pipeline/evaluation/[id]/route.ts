import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pipeline/evaluation/[id]
 * Get a specific evaluation pipeline by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const evaluation = await prisma.evaluationPipeline.findUnique({
      where: { id: params.id },
      include: {
        document: true
      }
    })
    
    return evaluation
      ? NextResponse.json(evaluation)
      : NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pipeline/evaluation/[id]
 * Update an evaluation pipeline
 * 
 * Request body:
 * {
 *   fileName?: string,
 *   page?: number,
 *   input?: string,
 *   output?: string,
 *   question?: string,
 *   grounded_context?: string,
 *   grounded_answer?: string,
 *   llm_answer?: string,
 *   llm_score?: number,
 *   metadata?: Json
 * }
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const updatedEvaluation = await prisma.evaluationPipeline.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(updatedEvaluation)
  } catch (error) {
    console.error('Error updating evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to update evaluation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pipeline/evaluation/[id]
 * Delete an evaluation pipeline
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.evaluationPipeline.delete({ where: { id: params.id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    console.error('Error deleting evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to delete evaluation' },
      { status: 500 }
    )
  }
}
