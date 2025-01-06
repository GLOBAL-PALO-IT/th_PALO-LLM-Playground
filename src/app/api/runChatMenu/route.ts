import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { zodResponseFormat } from 'openai/helpers/zod';
import { menuItemsListParams } from './tools';

export async function POST(request: Request) {
  const { messages }: { messages: ChatCompletionMessageParam[] } =
    await request.json()
  console.log(messages)
  try {
    const openai = new OpenAI()
    const completion = await openai.beta.chat.completions.parse({
      messages,
      model: ModelName.GPT4O,
      temperature: 0.2,
      max_tokens: 3000,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: zodResponseFormat(menuItemsListParams(), 'ListOfMenuItems'),
    })
    const message = completion.choices[0]?.message
    return NextResponse.json({ output: message?.parsed || undefined, })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
