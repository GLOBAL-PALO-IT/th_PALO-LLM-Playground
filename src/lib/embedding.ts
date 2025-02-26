import OpenAI from 'openai'
import { observeOpenAI } from "langfuse";
import { ModelName } from '@/lib/utils'
const openai = observeOpenAI(new OpenAI());
export const getEmbedding = async (text: string) => {
    if (text.length > 0) {
      text = text.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
      const openai = new OpenAI()
      const result = await openai.embeddings.create({
        input: text,
        model: ModelName.TEXTEMBEDDING3_LARGE,
      })
  
      const embeddings = result.data
      return embeddings[0].embedding
    } else {
      return []
    }
  
  }