
import { ModelName } from '@/lib/utils'
import { openaiInstance } from './openai'

export const getEmbedding = async (text: string) => {
    if (text.length > 0) {
      text = text.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')

      const result = await openaiInstance().embeddings.create({
        input: text,
        model: ModelName.TEXTEMBEDDING3_LARGE,
      })
  
      const embeddings = result.data
      return embeddings[0].embedding
    } else {
      return []
    }
  
  }