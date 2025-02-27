import { QdrantClient } from '@qdrant/js-client-rest'
import { NextResponse } from 'next/server'

export interface SearchResultPoint {
  id: string | number
  version?: number
  score?: number
  payload?:
    | Record<string, unknown>
    | {
        [key: string]: unknown
      }
    | null
    | undefined
  vector?:
    | Record<string, unknown>
    | number[]
    | number[][]
    | {
        [key: string]:
          | number[]
          | number[][]
          | {
              text: string
              model?: string | null | undefined
            }
          | {
              indices: number[]
              values: number[]
            }
          | undefined
      }
    | {
        text: string
        model?: string | null | undefined
      }
    | null
    | undefined
  shard_key?: string | number | Record<string, unknown> | null | undefined
  order_value?: number | Record<string, unknown> | null | undefined
}
export interface SearchResult {
  points: SearchResultPoint[]
}

export async function POST(request: Request) {
  const {
    collectionName,
    vector,
    topK,
  }: {
    collectionName: string
    vector: number[]
    topK?: number
  } = await request.json()
  // console.log(collectionName, vector)
  try {
    const response = await searchQuery(collectionName, vector,topK)
    return NextResponse.json({ data: response })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

export const searchQuery = async (
  collectionName: string,
  vector: number[],
  topK: number = 3
): Promise<SearchResult> => {
  try {
    const client = new QdrantClient({ host: 'localhost', port: 6333 })
    let searchResult = await client.query(collectionName, {
      query: vector,
      limit: topK,
      with_vector: false,
      with_payload: true,
    })

    return searchResult
  } catch (e) {
    console.error(`searchQuery Error: ${e}`)
    throw new Error(`searchQuery Error: ${e}`)
  }
}
