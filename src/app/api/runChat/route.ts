import { openaiInstance } from '@/lib/openai'
import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

export async function POST(request: Request) {
  const { messages }: { messages: ChatCompletionMessageParam[] } =
    await request.json()
  console.log(messages)
  try {

    const completion = await openaiInstance().chat.completions.create({
      messages,
      // model: "gpt-4o",
      model: ModelName.GPT4O,
      temperature: 0.2,
      max_tokens: 8192,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0
    })

    console.log(completion.choices[0])
    const message = completion.choices[0].message
    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
