import { openaiInstance } from '@/lib/openai'
import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

// Removed edge runtime to avoid Node.js module conflicts
// export const runtime = 'edge' 

export async function POST(request: Request) {
  const { messages, stream = false }: { messages: ChatCompletionMessageParam[]; stream?: boolean } =
    await request.json()
  
  console.log(messages)
  
  try {
    // Support streaming for real-time responses
    if (stream) {
      const completion = await openaiInstance().chat.completions.create({
        messages,
        model: ModelName.GPT4O,
        temperature: 0.2,
        max_tokens: 8192,
        top_p: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
      })

      // Create a readable stream for the client
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                // Send each chunk as it arrives
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-streaming fallback
    const completion = await openaiInstance().chat.completions.create({
      messages,
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
