import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from '@langchain/core/documents'

/**
 * POST /api/pipeline/document/upload
 * Upload a document file and create a document pipeline entry
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // Get the file name from the form data or use the original file name
    const customFileName = formData.get('fileName') as string
    const fileName = customFileName || file.name
    
    // Create a blob from the file
    const fileBlob = new Blob([file], { type: file.type })
    
    // Extract content based on file type
    let content: any = null
    
    if (file.type === 'application/pdf') {
      try {
        const loader = new PDFLoader(fileBlob)
        const docs: Document<Record<string, any>>[] = await loader.load()
        content = docs
      } catch (error) {
        console.error('Error parsing PDF:', error)
        return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
      }
    } else {
      // For other file types, you might want to implement different loaders
      // For now, we'll just store the file name
      content = null
      return NextResponse.json({ error: 'Non pdf does not support' }, { status: 500 })
    }
    
    // Create metadata with file information
    const metadata = {
      originalFileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    }
    
    // Create a new document pipeline entry
    const newDocument = await prisma.documentPipeline.create({
      data: {
        fileName,
        content,
        metadata
      }
    })
    
    return NextResponse.json(newDocument, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
