# Migration Guide: Adding Streaming to Other Components

## Overview
This guide helps developers add streaming support to other chat-based components in the Applied LLM Platform. Follow the patterns established in the Chat and RAGChat implementations.

## Target Components
Components that could benefit from streaming:
- `ChatWithTools` - Chat with tool calling
- `ChatInsurance` - Chat with insurance API
- `ChatMenu` - Chat for menu suggestions
- `ReActTavily` - ReAct agent with Tavily search
- `ReActShell` - ReAct shell agent
- `RAGAgentic` - Agentic RAG

## Step-by-Step Migration

### Step 1: Update the API Route

**Location**: `src/app/api/[your-route]/route.ts`

#### 1.1 Add Streaming Parameter
```typescript
export async function POST(request: Request) {
  const { messages, stream = false, ...otherParams } = await request.json()
  
  // ... rest of your code
}
```

#### 1.2 Add Streaming Response
```typescript
if (stream) {
  const completion = await openaiInstance().chat.completions.create({
    messages,
    model: ModelName.GPT4O,
    stream: true, // Enable streaming
    // ... other parameters
  })

  const encoder = new TextEncoder()
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        // Optional: Send metadata first
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'metadata', 
          data: yourMetadata 
        })}\n\n`))

        // Stream content
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'content',
              content 
            })}\n\n`))
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

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Keep existing non-streaming code as fallback
```

### Step 2: Update the Component

**Location**: `src/components/[YourComponent]/[YourComponent].tsx`

#### 2.1 Add Streaming State
```typescript
const [streamingContent, setStreamingContent] = useState<string>('')
const [isLoading, setIsLoading] = useState(false)
```

#### 2.2 Update Message Handler
```typescript
const handleSendMessage = async () => {
  if (!input.trim()) return

  const newMessage: ChatCompletionMessageParam = {
    role: 'user',
    content: input,
  }
  setMessages((prev) => [...prev, newMessage])
  setInput('')
  setIsLoading(true)
  setStreamingContent('')

  try {
    const response = await fetch('/api/your-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [...messages, newMessage],
        stream: true, // Enable streaming
        // ... other parameters
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch')
    }

    // Process streaming response
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
              // Finalize message
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
              
              // Handle metadata (if any)
              if (parsed.type === 'metadata') {
                handleMetadata(parsed.data)
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
  } catch (error: any) {
    console.error('Error:', error.message)
    showErrorToUser(error.message)
  } finally {
    setIsLoading(false)
  }
}
```

#### 2.3 Update Render
```tsx
<div className="chat-container">
  {/* Existing messages */}
  {messages.map((message, index) => (
    <div key={index} className={`message-bubble ${message.role}`}>
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  ))}
  
  {/* Streaming content */}
  {streamingContent && (
    <div className="message-bubble assistant streaming">
      <ReactMarkdown>{streamingContent}</ReactMarkdown>
      <span className="streaming-cursor">▊</span>
    </div>
  )}
</div>
```

### Step 3: Add Streaming Indicator CSS (Optional)

**Location**: Component's CSS file

```css
.streaming-cursor {
  animation: blink 1s infinite;
  color: #666;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

.message-bubble.streaming {
  background-color: #f0f0f0;
  border-left: 3px solid #4CAF50;
}
```

## Special Cases

### Tool Calling with Streaming

If your component uses tool calling, you need to handle tool calls separately:

```typescript
for await (const chunk of completion) {
  const delta = chunk.choices[0]?.delta
  
  // Handle content
  if (delta?.content) {
    accumulatedContent += delta.content
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
      type: 'content',
      content: delta.content 
    })}\n\n`))
  }
  
  // Handle tool calls
  if (delta?.tool_calls) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
      type: 'tool_call',
      data: delta.tool_calls 
    })}\n\n`))
  }
}
```

### RAG with Streaming

For components that do retrieval:

```typescript
// 1. Send search results first
const searchResults = await performSearch(query)
controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
  type: 'searchResults',
  data: searchResults 
})}\n\n`))

// 2. Then stream the AI response
const prompt = buildPromptWithContext(query, searchResults)
const completion = await openaiInstance().chat.completions.create({
  messages: [{ role: 'user', content: prompt }],
  stream: true,
})

for await (const chunk of completion) {
  // Stream content...
}
```

### Multi-Step Agents

For agents with multiple steps:

```typescript
// Send step updates
controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
  type: 'step',
  step: 'Analyzing query...' 
})}\n\n`))

// Execute step
const result = await executeStep()

// Send step result
controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
  type: 'step_result',
  data: result 
})}\n\n`))

// Continue with streaming response
```

## Testing Your Implementation

### 1. Manual Testing Checklist
- [ ] Component loads without errors
- [ ] Can send a message
- [ ] Streaming starts within 1-2 seconds
- [ ] Content appears word-by-word
- [ ] Complete message saved after streaming
- [ ] Can send multiple messages in a row
- [ ] Error handling works
- [ ] Loading states are correct
- [ ] UI responsive during streaming

### 2. Test Cases

**Test 1: Basic Streaming**
```
Input: "Hello, how are you?"
Expected: Immediate streaming response, smooth display
```

**Test 2: Long Response**
```
Input: "Write a long essay about AI"
Expected: Streaming continues smoothly for entire response
```

**Test 3: Quick Succession**
```
Input: Send 3 messages quickly
Expected: Each message streams correctly without overlap
```

**Test 4: Error Handling**
```
Action: Disconnect network during streaming
Expected: Graceful error, ability to retry
```

### 3. Performance Testing
```typescript
// Measure Time to First Token
const startTime = performance.now()
const response = await fetch(/* ... */)
const firstChunk = await reader.read()
const ttft = performance.now() - startTime
console.log('TTFT:', ttft, 'ms') // Should be < 1000ms
```

## Common Pitfalls

### 1. Not Clearing Streaming State
❌ Wrong:
```typescript
// Streaming content persists between messages
setMessages([...messages, newMessage])
```

✅ Correct:
```typescript
setMessages([...messages, newMessage])
setStreamingContent('') // Clear streaming state
```

### 2. Memory Leaks
❌ Wrong:
```typescript
// Reader not cleaned up
const reader = response.body?.getReader()
while (true) {
  await reader.read()
}
```

✅ Correct:
```typescript
let reader: ReadableStreamDefaultReader | undefined
try {
  reader = response.body?.getReader()
  while (true) {
    await reader.read()
  }
} finally {
  reader?.cancel() // Clean up
}
```

### 3. Not Handling Parse Errors
❌ Wrong:
```typescript
const parsed = JSON.parse(data) // Can throw
```

✅ Correct:
```typescript
try {
  const parsed = JSON.parse(data)
  // Handle parsed data
} catch {
  // Ignore parse errors gracefully
}
```

### 4. Forgetting [DONE] Signal
❌ Wrong:
```typescript
controller.close() // No done signal
```

✅ Correct:
```typescript
controller.enqueue(encoder.encode('data: [DONE]\n\n'))
controller.close()
```

## Example: Migrating ChatWithTools

Here's a complete example of migrating the ChatWithTools component:

### API Route Changes
```typescript
// src/app/api/runChatWithTools/route.ts
export async function POST(request: Request) {
  const { messages, stream = false } = await request.json()

  if (stream) {
    // Handle streaming with tools
    const completion = await openaiInstance().chat.completions.create({
      messages,
      model: ModelName.GPT4O,
      tools: bookTools, // Your existing tools
      stream: true,
    })

    const encoder = new TextEncoder()
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          let toolCalls: any[] = []
          
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta
            
            if (delta?.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'content',
                content: delta.content 
              })}\n\n`))
            }
            
            if (delta?.tool_calls) {
              toolCalls.push(...delta.tool_calls)
              // Execute tools and send results
              const results = await executeTools(toolCalls)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'tool_results',
                data: results 
              })}\n\n`))
            }
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }

  // Existing non-streaming code
  // ...
}
```

### Component Changes
```typescript
// src/components/ChatWithTools/ChatWithTools.tsx
const [streamingContent, setStreamingContent] = useState<string>('')
const [toolResults, setToolResults] = useState<any[]>([])

const handleSendMessage = async () => {
  // ... setup code

  try {
    const response = await fetch('/api/runChatWithTools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [...messages, newMessage],
        stream: true 
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
              
              if (parsed.type === 'content' && parsed.content) {
                accumulatedContent += parsed.content
                setStreamingContent(accumulatedContent)
              }
              
              if (parsed.type === 'tool_results') {
                setToolResults(parsed.data)
              }
            } catch {
              // Ignore
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    setIsLoading(false)
  }
}
```

## Resources

- [Implementation Summary](./summary.md) - Full implementation details
- [Quick Reference](./quick-reference.md) - Code snippets and examples
- [Verification Checklist](./verification-checklist.md) - Testing guide
- [OpenAI Streaming Docs](https://platform.openai.com/docs/api-reference/streaming)
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

## Need Help?

If you encounter issues while migrating:
1. Check the working examples in `/chat` and `/ragChat`
2. Review the quick reference guide
3. Test with non-streaming mode first
4. Use browser DevTools to debug streaming
5. Check the verification checklist for common issues

## Contributing

After successfully migrating a component:
1. Add it to the list of streaming-enabled components
2. Update the implementation notes
3. Add any new patterns to this guide
4. Create tests for your implementation
