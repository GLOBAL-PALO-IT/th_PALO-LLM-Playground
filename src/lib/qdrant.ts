import { SearchResult, SearchResultPoint } from '@/types/qdrant'
import { QdrantClient } from '@qdrant/js-client-rest'


export const searchQueryByIds = async (
  collectionName: string,
  ids: number[],
): Promise<SearchResultPoint[]> => {
  try {
    const client = new QdrantClient({ host: 'localhost', port: 6333 })
    let searchResult = await client.retrieve(collectionName, {
      ids,
      with_vector: false,
      with_payload: true,
    })

    return searchResult
  } catch (e) {
    console.error(`searchQuery Error: ${e}`)
    throw new Error(`searchQuery Error: ${e}`)
  }
}

export const searchQuery = async (
  collectionName: string,
  vector: number[],
  topK: number = 3,
  excludeIds?: number[]
): Promise<SearchResult> => {
  try {
    console.log({ topK })
    const client = new QdrantClient({ host: 'localhost', port: 6333 })
    let searchResult = await client.query(collectionName, {
      query: vector,
      limit: topK,
      with_vector: false,
      with_payload: true,
      filter: {
        must_not: {
          has_id: excludeIds
        }
      }
    })

    return searchResult
  } catch (e) {
    console.error(`searchQuery Error: ${e}`)
    throw new Error(`searchQuery Error: ${e}`)
  }
}
