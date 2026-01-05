'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { MenuItemsListParamsType } from '@/app/api/runChatMenu/tools'
import { isJsonParsable } from '@/lib/jsonHelpers'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import React from 'react'
import {
    FaMagic,
} from 'react-icons/fa'
import {
    JsonView,
    allExpanded,
    darkStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import './chat.css'
import { exampleQuery } from './exampleQuery'
import ExamplesDropDown from './ExamplesDropDown'
import { MenuBox } from './MenuBox'
const SYSTEM_PROMPT: ChatCompletionMessageParam = {
  role: 'system',
  content:
    'Based on the user input, return a list of menu items with their corresponding links. The menu items must be in a JSON format.',
}
const ChatMenu = () => {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    SYSTEM_PROMPT,
  ])
  const [input, setInput] = useState<string>(
    exampleQuery[Math.floor(Math.random() * exampleQuery.length)]
  )
  const [isLoading, setIsLoading] = useState(false)
  const [showFormattedPrompt, setShowFormattedPrompt] = useState(true)
  const [, setMenuOutput] = useState<MenuItemsListParamsType[]>(
[]
  )
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add the user's message to the chat
    const newMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: input,
    }
    // setMessages((prev) => [...prev, newMessage])

    // Clear the input field
    setInput('')

    setIsLoading(true)

    try {
      const payload: ChatCompletionMessageParam[] = [SYSTEM_PROMPT, ...messages,newMessage]
      setMessages(payload)
      const response = await fetch('/api/runChatMenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })
      const { output }: { output: MenuItemsListParamsType } = await response.json()
      
      

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: JSON.stringify(output)
      }])
      setMenuOutput((prev) => [...prev, output])

    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Prevents new line when pressing Enter
      handleSendMessage()
    }
  }

  return (
    <div className="">
      <div className="">
        {/* Chat history */}
        <div className="pl-4 flex flex-row">
          <h1 className="text-2xl font-bold">Chat with Menus</h1>
          {showFormattedPrompt ? (
            <button onClick={() => setShowFormattedPrompt(false)}>
              <FaMagic className="m-1" />
            </button>
          ) : (
            <button onClick={() => setShowFormattedPrompt(true)}>
              <FaMagic className="m-1" />
            </button>
          )}
        </div>
        <div className="pl-4">
          <ExamplesDropDown setInput={setInput} />
        </div>

        <div className="flex flex-col p-4 m-4 max-h-[50vh] h-[50vh] overflow-auto mb-40 space-y-2 p-4 border-2 border-gray-300 rounded-lg">
          {showFormattedPrompt ? (
            messages.filter((message) => message.role !== 'system')?.map((message, index) => {
              const isJson = isJsonParsable(message.content as string)

              let shownComponent = null

              if (message.role === 'user') {
                shownComponent = (
                  <ReactMarkdown>{message.content as string}</ReactMarkdown>
                )
              } else {
                shownComponent = isJson ? <MenuBox selectedMenu={JSON.parse(message.content as string).selectedMenu} /> : <ReactMarkdown>{JSON.stringify(message)}</ReactMarkdown>
              }


              return (
                <div
                  key={index}
                  className={`message-bubble ${message.role === 'user' ? 'human-message bg-blue-200' : 'ai-message border-gray-400 border-2'} ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <h3 className="text-sm mb-2">{message.role.toUpperCase()}</h3>
                  {shownComponent}
                </div>
              )
            })
          ) : (
            <JsonView
              data={messages}
              shouldExpandNode={allExpanded}
              style={darkStyles}
            />
          )}
        </div>

        {/* Input and Send Button */}
        <div className="p-4 mt-4 w-full flex justify-center items-end fixed bottom-0 left-0">
          <form onSubmit={handleSendMessage} className="w-full">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-2 border-2 border-gray-300 rounded-lg flex-1"
              rows={3} // Adjust the number of rows for height
              onKeyDown={handleKeyDown} // Tie Enter key to submission
            />
            <Button
              type="submit"
              onClick={handleSendMessage}
              className="bg-blue-500 items-center justify-center ml-2"
              disabled={isLoading}
            >
              Send
              {isLoading && <Spinner className="flex ml-1" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatMenu
