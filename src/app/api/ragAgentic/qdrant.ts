import { QdrantClient } from '@qdrant/js-client-rest'
import { SearchResultPoint } from '../qdrant/searchEmbeddings/route'

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