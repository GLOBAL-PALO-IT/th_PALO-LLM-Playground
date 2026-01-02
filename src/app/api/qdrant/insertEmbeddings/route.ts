import { QdrantClient } from '@qdrant/js-client-rest'
import { NextResponse } from 'next/server'
import { EmbeddingQdrant, OperationInfo } from './types'
/*
====FE Code====
fetch('/api/qdrant/insertEmbeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionName,
        embeddings: embeddingsSourceDocuments.map((embedding, index) => ({
          // id: embedding.id,
          embedding: embedding.embedding,
          pageContent: pdfContent[index].pageContent,
          metadata: pdfContent[index].metadata,
        })),
      }),
    })

*/
//Next JS API Route POST
export async function POST(request: Request) {
  const {
    collectionName,
    embeddings,
  }: {
    collectionName: string
    embeddings: EmbeddingQdrant[]
  } = await request.json()
  try {
    const response = await insertEmbeddings(collectionName, embeddings)
    return NextResponse.json({ data: response })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

const insertEmbeddings = async (
  collectionName: string,
  embeddings: EmbeddingQdrant[]
): Promise<OperationInfo[]> => {
  try {
    const chunkSize = 100
    const splits = [];
    let start_idx = 0;
    while (start_idx < embeddings.length) {
      const end_idx = Math.min(start_idx + chunkSize, embeddings.length);
      const chunk = embeddings.slice(start_idx, end_idx);
      splits.push(chunk);

      start_idx = end_idx;
    }
    console.log({ splitsSize: splits.length })
    const client = new QdrantClient({ host: 'localhost', port: 6333 })
    const operationResults = await Promise.all(
      splits.map(async(embeddings) => {
        const points = embeddings.map((embedding, index) => ({
          id: index,
          vector: embedding.embedding,
          payload: {
            pageContent: embedding.pageContent,
            ...embedding.metadata,
          },
        }))
    
        const operationInfo = await client.upsert(collectionName, {
          points,
          wait: true,
        })
        return operationInfo
      })
    )
    
    return operationResults
  } catch (error) {
    console.error('Error insertEmbeddings:', error)
    throw new Error(`Error insertEmbeddings: ${error}`)
  }
}
