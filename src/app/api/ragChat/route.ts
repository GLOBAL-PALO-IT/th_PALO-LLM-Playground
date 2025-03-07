import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { searchQuery } from '@/lib/qdrant'
import { ragChatPromptBuilder } from './prompt'

export async function POST(request: Request) {
  const { 
    messages, 
    searchIndex, 
    topK = 10 
  }:
    {
      messages: ChatCompletionMessageParam[];
      searchIndex: string
      topK: number
    } =
    await request.json()
  console.log(messages)
  try {
    const latestMessage = messages[messages.length - 1]
    if (!latestMessage.content) {
      return NextResponse.json({ output: 'Message content cannot be empty' }, { status: 400 })
    }
    const question = latestMessage.content
    //if text is empty return error
    if (typeof question !== 'string' || question.length === 0) {
      return NextResponse.json({ output: 'Please enter a valid text' }, { status: 400 })
    }
    const { prompt, searchResult } = await getPromptWithContext(question, searchIndex, topK)
    const openai = new OpenAI()
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: ModelName.GPT4O,
      temperature: 0.2,
      max_tokens: 8192,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    console.log(completion.choices[0])
    const message = completion.choices[0].message
    return NextResponse.json({ message, prompt, searchResult })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

const getPromptWithContext = async (question: string, searchIndex: string, topK: number) => {
  const embeddings = await getEmbedding(question)
  const searchResult = await searchQuery(searchIndex, embeddings, topK)
  const searchResultText = searchResult.points.map((point) => point.payload?.pageContent as string)
  console.log({ searchResultText })
  const prompt = await ragChatPromptBuilder(searchResultText, question)
  // console.log({prompt})
  return { prompt, searchResult }
}

const getEmbedding = async (text: string) => {
  if (text.length > 0) {
    text = text.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
    const openai = new OpenAI()
    const result = await openai.embeddings.create({
      input: text,
      model: 'text-embedding-3-large',
    })

    const embeddings = result.data
    return embeddings[0].embedding
  } else {
    return []
  }

}