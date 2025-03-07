import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pipeline/translation
 * Get all translation pipelines
 */
export async function GET(req: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(req.url)
    const docId = searchParams.get('docId')
    
    // Build query conditions
    const where = docId ? { docId } : undefined
    
    const translations = await prisma.translationPipeline.findMany({
      where,
      include: {
        document: true
      }
    })
    
    return NextResponse.json(translations)
  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pipeline/translation
 * Create a new translation pipeline
 * 
 * Request body:
 * {
 *   docId: string,
 *   fileName: string,
 *   page?: number,
 *   input: string,
 *   output?: string,
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
    
    const newTranslation = await prisma.translationPipeline.create({ data })
    return NextResponse.json(newTranslation, { status: 201 })
  } catch (error) {
    console.error('Error creating translation:', error)
    return NextResponse.json(
      { error: 'Failed to create translation' },
      { status: 500 }
    )
  }
}
