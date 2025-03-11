import { openaiInstance } from '@/lib/openai'
import { NextResponse } from 'next/server'


export async function POST(request: Request) {
  const { texts }: { texts: string[] } = await request.json()


  const input = texts
    .map((text) => {
      //clean text replace all \n with '' and \t with '' and space with ''
      text = text.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
      return text
    })
    .filter((text) => text.length > 0) //filter out empty strings
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
        const result = await openaiInstance().embeddings.create({
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
