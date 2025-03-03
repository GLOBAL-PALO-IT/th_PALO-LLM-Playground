import { NextResponse } from 'next/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from '@langchain/core/documents'
import { TokenTextSplitter, RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// splitter enum
export enum Splitter {
  Token = 'token',
  Character = 'character',
  Page = 'page',
  None = 'none',
  PageToken = 'pageToken',
}
export async function POST(req: Request) {

  const formData = await req.formData()
  const pdfFile = formData.get('pdf') as File
  const splitter = formData.get('splitter') as string
  const chunkSize = parseInt(formData.get('chunkSize') as string)
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

    if (splitter === Splitter.Token || splitter === Splitter.PageToken) {
      textSplitterMethod = new TokenTextSplitter({
        encodingName: 'gpt2',
        chunkSize: chunkSize ?? 500,
        chunkOverlap: 50,
      });
    } else if (splitter === Splitter.Character) {
      textSplitterMethod = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize && 500,
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



    if (textSplitterMethod !== null && !splitter.startsWith('page')) {
      const docsToText = docs.map((doc) => {
        const pageNumber: number = doc.metadata.loc.pageNumber

        const pageNumberStr = pageNumber.toString()
        const xmlTag = `page-${pageNumberStr}`
        return `<${xmlTag}> ${doc.pageContent}</${xmlTag}>`
      }).join(`\n`)
      const docsSplit = await textSplitterMethod.createDocuments([docsToText])
      return NextResponse.json({ content: docsSplit }, { status: 200 })
    } else {
      if(splitter === Splitter.PageToken){
        const splitDocs = await textSplitterMethod?.splitDocuments(docs)
        return NextResponse.json({ content: splitDocs }, { status: 200 })
      }else{
        return NextResponse.json({ content: docs }, { status: 200 })
      }
    }

  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
