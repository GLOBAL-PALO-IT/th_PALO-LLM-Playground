'use server'

import { openaiInstance } from '@/lib/openai'
import { ModelName } from '@/lib/utils'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

/**
 * Server action for streaming chat completions
 * This uses OpenAI's streaming API with Next.js streaming response
 */
export async function streamChatCompletion(
  messages: ChatCompletionMessageParam[]
): Promise<ReadableStream> {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
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

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }

        controller.close()
      } catch (error) {
        console.error('Error in streamChatCompletion:', error)
        controller.error(error)
      }
    },
  })

  return stream
}

/**
 * Non-streaming version for backward compatibility
 */
export async function getChatCompletion(
  messages: ChatCompletionMessageParam[]
) {
  try {
    const completion = await openaiInstance().chat.completions.create({
      messages,
      model: ModelName.GPT4O,
      temperature: 0.2,
      max_tokens: 8192,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    const message = completion.choices[0].message
    return { success: true, message }
  } catch (error: any) {
    console.error('Error in getChatCompletion:', error)
    return { success: false, error: error.message }
  }
}
