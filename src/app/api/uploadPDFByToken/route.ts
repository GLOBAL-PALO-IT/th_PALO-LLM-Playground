import { NextResponse } from 'next/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from '@langchain/core/documents'
import { CharacterTextSplitter, TokenTextSplitter,RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
export async function POST(req: Request) {
  
  const formData = await req.formData()
  const pdfFile = formData.get('pdf') as File
  const splitter = formData.get('splitter') as string
  //Blob of pdfFile
  const pdfBlob = new Blob([pdfFile], { type: pdfFile.type })

  console.log('pdfFile', pdfFile)
  if (!pdfFile) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const loader = new PDFLoader(pdfBlob)
    const docs: Document<Record<string, any>>[] = await loader.load()
    let textSplitterMethod = null
    
    if (splitter === 'token') {
      textSplitterMethod = new TokenTextSplitter({
        chunkSize: 5000,
        chunkOverlap: 1000,
      });
    }else if(splitter === 'character'){
      textSplitterMethod = new RecursiveCharacterTextSplitter({
        
        chunkSize: 500,
        chunkOverlap: 50,
      });
    }
    
    // console.log({ doc: docs[0].metadata })
    // doc.metadata: {
    //   source: 'blob',
    //   blobType: 'application/pdf',
    //   pdf: {
    //     version: '1.10.100',
    //     info: [Object],
    //     metadata: null,
    //     totalPages: 9
    //   },
    //   loc: { pageNumber: 1 }
    // }
    const docsToText = docs.map((doc) => {
      const pageNumber: number = doc.metadata.loc.pageNumber

      const pageNumberStr = pageNumber.toString()
      const xmlTag = `page-${pageNumberStr}`
      return `<${xmlTag}> ${doc.pageContent}</${xmlTag}>`
    }).join(`\n`)
    console.log({ splitter,textSplitterMethod })
    if(textSplitterMethod !== null){
      const docsSplit = await textSplitterMethod.createDocuments([docsToText])
      return NextResponse.json({ content: docsSplit }, { status: 200 })
    }else{
      return NextResponse.json({ content: docs }, { status: 200 })
    }
    

    // const docsSplit = textSplitter.splitText(docsToText)
    // console.log({ docsSplit })

    
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
