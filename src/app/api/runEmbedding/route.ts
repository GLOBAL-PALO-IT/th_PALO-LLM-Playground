import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  const { texts }: { texts: string[] } = await request.json()
  const openai = new OpenAI()

  const input = texts
    .map((text) => {
      //clean text replace all \n with '' and \t with '' and space with ''
      text = text.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
      return text
    })
    .filter((text) => text.length > 0) //filter out empty strings
/*
let start_idx = 0;
        while (start_idx < input_ids.length) {
            if (start_idx > 0) {
                start_idx -= this.chunkOverlap;
            }
            const end_idx = Math.min(start_idx + this.chunkSize, input_ids.length);
            const chunk_ids = input_ids.slice(start_idx, end_idx);
            splits.push(this.tokenizer.decode(chunk_ids));
            start_idx = end_idx;
        }
        return splits;
*/
  const chunkSize = 100
  const splits = [];
  let start_idx = 0;
  while(start_idx < input.length){
    const end_idx = Math.min(start_idx + chunkSize, input.length);
    const chunk = input.slice(start_idx, end_idx);
    splits.push(chunk);
    
    start_idx = end_idx;
  }
  console.log({splitsSize: splits.length})

  try {
    // Promise all
    const embeddingResults = await Promise.all(
      splits.map(async (split) => {
        const result = await openai.embeddings.create({
          input: split,
          model: 'text-embedding-3-large',
        })

        const embeddings = result.data
        return embeddings
      })
    )
    //merge embeddingResults into one array
    const embeddings = embeddingResults.flat()

    return NextResponse.json({
      embeddings: embeddings,
    })
  } catch (error: any) {
    console.log(error)
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
