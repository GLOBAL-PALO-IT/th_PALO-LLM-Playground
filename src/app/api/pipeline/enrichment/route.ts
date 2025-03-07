import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pipeline/enrichment
 * Get all enrichment pipelines
 */
export async function GET(req: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(req.url)
    const docId = searchParams.get('docId')
    
    // Build query conditions
    const where = docId ? { docId } : undefined
    
    const enrichments = await prisma.enrichmentPipeline.findMany({
      where,
      include: {
        document: true
      }
    })
    
    return NextResponse.json(enrichments)
  } catch (error) {
    console.error('Error fetching enrichments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrichments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pipeline/enrichment
 * Create a new enrichment pipeline
 * 
 * Request body:
 * {
 *   docId: string,
 *   fileName: string,
 *   page?: number,
 *   input: string,
 *   output?: Json,
 *   metadata?: Json
 * }
 */
export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Validate required fields
    if (!data.docId || !data.fileName || !data.input) {
      return NextResponse.json(
        { error: 'Missing required fields: docId, fileName, and input are required' },
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
    
    const newEnrichment = await prisma.enrichmentPipeline.create({ data })
    return NextResponse.json(newEnrichment, { status: 201 })
  } catch (error) {
    console.error('Error creating enrichment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrichment' },
      { status: 500 }
    )
  }
}
