import { NextResponse } from 'next/server'

import { zodResponseFormat } from 'openai/helpers/zod'
import { ChatCompletionMessageParam } from 'openai/resources/index.js'
import { ModelName } from '@/lib/utils'
import { openaiInstance } from '@/lib/openai'
import { ExecutionSchema } from './types'

export async function POST(request: Request) {
  const { messages }: { messages: ChatCompletionMessageParam[] } =
    await request.json()
  try {
    const completion = await openaiInstance().beta.chat.completions.parse({
      messages,
      model: ModelName.GPT4O,
      temperature: 0.2,
      max_tokens: 3000,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: zodResponseFormat(ExecutionSchema, 'execution'),
    })
    // console.dir(completion, { depth: 5 })

    const message = completion.choices[0]?.message

    return NextResponse.json({
      output: message?.parsed || undefined,
      messages,
      completion,
    })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
