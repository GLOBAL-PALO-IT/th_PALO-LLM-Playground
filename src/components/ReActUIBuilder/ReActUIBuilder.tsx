'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { cn } from '@/lib/utils'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import 'react-json-view-lite/dist/index.css'
import { Spinner } from '../ui/spinner'
import './chat.css'
import CodePreview from './CodePreview'

const ReActUIBuilder = () => {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [llmResponse, setLlmResponse] = useState('')

  const handleSendMessage = async (query: string) => {
    if (!query.trim()) return

    // Add the user's message to the chat
    const newMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: query,
    }
    setMessages((prev) => [...prev, newMessage])

    setIsLoading(true)

    try {
      const response = await fetch('/api/runBuildUI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const { message } = await response.json()
      console.log({ message })

      setLlmResponse(message.content)
      setMessages((prev) => [...prev, message])
    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="">
      <div className="p-4 flex flex-col space-y-4">
        {/* Chat history */}
        <h1 className="text-2xl font-bold">UI Builder</h1>
        <div className="flex flex-col max-h-[50vh] h-[50vh] overflow-auto space-y-2 border-2 border-gray-300 rounded-lg relative p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-bubble ${message.role === 'user' ? 'human-message bg-blue-200' : 'ai-message bg-green-200'} ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
            >
              <ReactMarkdown>
                {typeof message.content === 'string' ? message.content : ''}
              </ReactMarkdown>
            </div>
          ))}

          {isLoading && (
            <div className="message-bubble ai-message bg-green-200 mr-auto">
              <Spinner className="flex ml-1" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-5">Example Queries</h3>
          <ul className="flex flex-col w-full">
            {exampleQueries.map((query, index) => (
              <li
                className={cn(
                  'mb-2 w-full cursor-pointer',
                  isLoading && 'opacity-50 pointer-events-none'
                )}
                key={index}
                onClick={() => {
                  if (!isLoading) {
                    handleSendMessage(query)
                  }
                }}
              >
                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
                  {query}
                </pre>
              </li>
            ))}
          </ul>
        </div>

        <CodePreview llmResponse={llmResponse} />
      </div>
    </div>
  )
}

export const exampleQueries = [
  'Please help create login form with email and password fields, and a submit button. With validation for email and password fields',
  'Please create an animated button with a loading spinner, and a success message',
  'Please create profile page, to show user details like name, email, and phone number',
  'Plase create a landing page with a hero section, features section, and a footer for a consulting firm website',
]

export default ReActUIBuilder
