# Streaming API Quick Reference

## Overview
Quick reference guide for using the streaming APIs in the Applied LLM Platform.

## Basic Usage

### Client-Side: Chat Component

```typescript
import { useState } from 'react'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

const MyChatComponent = () => {
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])

  const handleSendMessage = async (userMessage: string) => {
    const newMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: userMessage,
    }
    setMessages((prev) => [...prev, newMessage])
    setStreamingContent('')

    const response = await fetch('/api/runChat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [...messages, newMessage], 
        stream: true  // Enable streaming
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let accumulatedContent = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              // Streaming complete - save message
              const assistantMessage: ChatCompletionMessageParam = {
                role: 'assistant',
                content: accumulatedContent,
              }
              setMessages((prev) => [...prev, assistantMessage])
              setStreamingContent('')
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                setStreamingContent(accumulatedContent)
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    }
  }

  return (
    <div>
      {/* Display messages */}
      {messages.map((msg, idx) => (
        <div key={idx}>{msg.content}</div>
      ))}
      
      {/* Display streaming content */}
      {streamingContent && (
        <div>{streamingContent}</div>
      )}
    </div>
  )
}
```

### Server-Side: API Route

```typescript
import { openaiInstance } from '@/lib/openai'
import { ModelName } from '@/lib/utils'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

export async function POST(request: Request) {
  const { messages, stream = false } = await request.json()

  if (stream) {
    // Streaming mode
    const completion = await openaiInstance().chat.completions.create({
      messages,
      model: ModelName.GPT4O,
      temperature: 0.2,
      stream: true,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
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
  })

  return Response.json({ message: completion.choices[0].message })
}
```

## RAG Chat with Streaming

### Client-Side

```typescript
const handleRAGQuery = async (query: string, searchIndex: string, topK: number) => {
  const response = await fetch('/api/ragChat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: query }],
      searchIndex,
      topK,
      stream: true
    }),
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let accumulatedContent = ''
  let searchResults = null

  if (reader) {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            
            // Handle search results
            if (parsed.type === 'searchResult') {
              searchResults = parsed.data
              setDebugSearchResult(parsed.data)
            }
            
            // Handle streaming content
            if (parsed.type === 'content' && parsed.content) {
              accumulatedContent += parsed.content
              setStreamingContent(accumulatedContent)
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }
}
```

## Using Server Actions (Alternative)

```typescript
// server-action.ts
'use server'

import { streamChatCompletion } from '@/lib/actions/chat-actions'

export async function getStreamingResponse(messages: ChatCompletionMessageParam[]) {
  return await streamChatCompletion(messages)
}

// component.tsx
import { getStreamingResponse } from './server-action'

const MyComponent = () => {
  const handleSubmit = async () => {
    const stream = await getStreamingResponse(messages)
    const reader = stream.getReader()
    // Process stream...
  }
}
```

## Error Handling

```typescript
try {
  const response = await fetch('/api/runChat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  // Process stream...
} catch (error) {
  console.error('Streaming error:', error)
  // Show user-friendly error message
  showError('Failed to get response. Please try again.')
} finally {
  setIsLoading(false)
}
```

## Best Practices

### 1. Always Clean Up Resources
```typescript
let reader: ReadableStreamDefaultReader | undefined

try {
  reader = response.body?.getReader()
  // Process stream...
} finally {
  reader?.cancel()
}
```

### 2. Handle Connection Interruptions
```typescript
const timeout = setTimeout(() => {
  reader?.cancel()
  showError('Request timed out')
}, 30000) // 30 second timeout

try {
  // Process stream...
} finally {
  clearTimeout(timeout)
}
```

### 3. Provide Visual Feedback
```typescript
// Show loading indicator
setIsLoading(true)

// Show streaming indicator
if (streamingContent) {
  return <div className="streaming">{streamingContent}▊</div>
}

// Clear loading when done
setIsLoading(false)
```

### 4. Optimize Re-renders
```typescript
// Use React.memo for expensive components
const MessageBubble = React.memo(({ content }: { content: string }) => {
  return <div>{content}</div>
})

// Use useMemo for expensive calculations
const formattedContent = useMemo(() => {
  return parseMarkdown(streamingContent)
}, [streamingContent])
```

## Testing

### Manual Test
```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000/chat

# Test streaming
# 1. Type a message
# 2. Click Send
# 3. Observe word-by-word streaming
# 4. Verify complete message is saved
```

### Automated Test (Example)
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chat from './Chat'

test('streams response word by word', async () => {
  render(<Chat />)
  
  const input = screen.getByPlaceholderText('Type a message...')
  const sendButton = screen.getByText('Send')
  
  await userEvent.type(input, 'Hello')
  await userEvent.click(sendButton)
  
  // Should see streaming content appear
  await waitFor(() => {
    expect(screen.getByText(/Hello/i)).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Streaming Not Working
1. Check browser console for errors
2. Verify `stream: true` in request
3. Check API key is valid
4. Verify OpenAI API is accessible

### Performance Issues
1. Check for memory leaks (use Chrome DevTools)
2. Verify no infinite loops
3. Check network throttling
4. Monitor CPU usage

### Display Issues
1. Ensure streaming content state is updated
2. Check React key prop on lists
3. Verify CSS for streaming indicator
4. Test on different browsers

## API Reference

### POST /api/runChat
**Request Body:**
```typescript
{
  messages: ChatCompletionMessageParam[]
  stream?: boolean  // Default: false
}
```

**Response (Streaming):**
```
Content-Type: text/event-stream

data: {"content": "Hello"}\n\n
data: {"content": " world"}\n\n
data: [DONE]\n\n
```

**Response (Non-streaming):**
```json
{
  "message": {
    "role": "assistant",
    "content": "Hello world"
  }
}
```

### POST /api/ragChat
**Request Body:**
```typescript
{
  messages: ChatCompletionMessageParam[]
  searchIndex: string
  topK: number
  stream?: boolean  // Default: false
}
```

**Response (Streaming):**
```
data: {"type": "searchResult", "data": {...}}\n\n
data: {"type": "content", "content": "Hello"}\n\n
data: {"type": "content", "content": " world"}\n\n
data: [DONE]\n\n
```

## Resources

- [Implementation Summary](./summary.md)
- [Verification Checklist](./verification-checklist.md)
- [OpenAI Streaming Docs](https://platform.openai.com/docs/api-reference/streaming)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
