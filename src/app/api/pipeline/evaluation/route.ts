import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pipeline/evaluation
 * Get all evaluation pipelines
 */
export async function GET(req: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(req.url)
    const docId = searchParams.get('docId')
    
    // Build query conditions
    const where = docId ? { docId } : undefined
    
    const evaluations = await prisma.evaluationPipeline.findMany({
      where,
      include: {
        document: true
      }
    })
    
    return NextResponse.json(evaluations)
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pipeline/evaluation
 * Create a new evaluation pipeline
 * 
 * Request body:
 * {
 *   docId: string,
 *   fileName: string,
 *   page?: number,
 *   input: string,
 *   output: string,
 *   question?: string,
 *   grounded_context?: string,
 *   grounded_answer?: string,
 *   llm_answer?: string,
 *   llm_score?: number,
 *   metadata?: Json
 * }
 */
export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Validate required fields
    if (!data.docId || !data.fileName || !data.input || !data.output) {
      return NextResponse.json(
        { error: 'Missing required fields: docId, fileName, input, and output are required' },
        { status: 400 }
      )
    }
    
    // Verify the document exists
    const document = await prisma.documentPipeline.findUnique({
      where: { id: data.docId }
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    const newEvaluation = await prisma.evaluationPipeline.create({ data })
    return NextResponse.json(newEvaluation, { status: 201 })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    )
  }
}
