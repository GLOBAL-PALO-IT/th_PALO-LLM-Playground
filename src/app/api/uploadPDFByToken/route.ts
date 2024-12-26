import { NextResponse } from 'next/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from '@langchain/core/documents'
import { TokenTextSplitter } from "@langchain/textsplitters";
export async function POST(req: Request) {
  
  const formData = await req.formData()
  const pdfFile = formData.get('pdf') as File
  //Blob of pdfFile
  const pdfBlob = new Blob([pdfFile], { type: pdfFile.type })

  console.log('pdfFile', pdfFile)
  if (!pdfFile) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const loader = new PDFLoader(pdfBlob)
    const docs: Document<Record<string, any>>[] = await loader.load()
    const textSplitter = new TokenTextSplitter({
      chunkSize: 10000,
      chunkOverlap: 100,
    });
    const docsToText = docs.map((doc) => {
      return doc.pageContent
    }).join('[end of page]')

    const docsSplit = textSplitter.splitText(docsToText)

    return NextResponse.json({ content: docsSplit }, { status: 200 })
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
