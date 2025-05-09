'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { Checkbox } from "@/components/ui/checkbox"
import './chat.css'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import React from 'react'
import {
  FaEye,
  FaEyeSlash,
  FaFileDownload,
  FaInfoCircle,
  FaMagic,
  FaRegClipboard,
} from 'react-icons/fa'
import {
  JsonView,
  allExpanded,
  darkStyles,
  collapseAllNested,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { Input } from '@/components/ui/input'
import IndexesDropDown from './IndexesDropDown'

const RAGChat = () => {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])
  const [input, setInput] = useState<string>('')
  const [searchIndex, setSearchIndex] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFormattedPrompt, setShowFormattedPrompt] = useState(true)
  const [collections, setCollections] = useState<string[]>([])
  const [qdrantConnection, setQdrantConnection] = useState<string>('')
  const [debugPrompt, setDebugPrompt] = useState<string>('')
  const [debugSearchResult, setDebugSearchResult] = useState()
  const [topK, setTopK] = useState<number>(10)
  const [seeDebugSearchResult, setSeeDebugSearchResult] = useState<boolean>(false)
  const checkQdrantConnection = async () => {
    try {
      const response = await fetch('http://localhost:6333', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      setQdrantConnection(`${response.ok ? 'OK' : 'NOT OK'} ${JSON.stringify(data)}`)
    } catch (e) {
      setQdrantConnection(`Error checkQdrantConnection: ${e}`)
      console.error('Error checkQdrantConnection:', e)
    }
  }

  useEffect(() => {
    checkQdrantConnection()
  }, [])

  const getCollectionList = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/qdrant/getCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const {
        data,
      }: {
        data: {
          collections: {
            name: string
          }[]
        }
      } = await response.json()

      setCollections(data.collections?.map((collection) => collection.name))
    } catch (e) {
      console.error('Error getCollectionList:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add the user's message to the chat
    const newMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: input,
    }
    setMessages([newMessage])

    // Clear the input field
    setInput('')

    setIsLoading(true)

    try {
      const response = await fetch('/api/ragChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [newMessage],
          searchIndex,
          topK
        }),
      })
      const { message, prompt, searchResult } = await response.json()
      console.log({ message })
      setMessages((prev) => [...prev, message])
      setDebugPrompt(prompt)
      setDebugSearchResult(searchResult)
    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getCollectionList()
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Prevents new line when pressing Enter
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-row space-x-4 m-3 w-full">
      <div className="flex flex-col w-[90%] m-4">
        <h1 className="text-2xl font-bold">RAG Chat with {searchIndex} {showFormattedPrompt ? (
          <button onClick={() => setShowFormattedPrompt(false)}>
            <FaMagic className="m-1" />
          </button>
        ) : (
          <button onClick={() => setShowFormattedPrompt(true)}>
            <FaMagic className="m-1" />
          </button>
        )}</h1>
        <div className={`p-4 flex flex-row content-center items-center ${qdrantConnection ? 'text-green-500' : 'text-gray-500'}`}>
          Qdrant Connection: {qdrantConnection}
        </div>
        <div className="p-2 flex flex-row content-center items-center space-x-2">
          {collections.length > 0 && <IndexesDropDown setInput={setSearchIndex} collections={collections} />}

          <Input
            type="number"
            defaultValue={10}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            value={topK}
            className='w-24'
          />
          <div className="flex items-center space-x-2 ml-4">
            <Checkbox id="see-debug-search-result" onCheckedChange={(checked) => setSeeDebugSearchResult(checked ? true : false)} />
            <label
              htmlFor="see-debug-search-result"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              See Debug Search Result
            </label>
          </div>
        </div>
        <div className="flex flex-col">
          {/* Chat history */}
          <div className=" w-full flex flex-col p-4 m-4 max-h-[50vh] h-[40vh] overflow-auto mb-40 space-y-2 p-4 border-2 border-gray-300 rounded-lg">
            {showFormattedPrompt ? (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`message-bubble ${message.role === 'user' ? 'human-message bg-blue-200' : 'ai-message bg-green-200'} ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <ReactMarkdown>
                    {typeof message.content === 'string' ? message.content : ''}
                  </ReactMarkdown>
                </div>
              ))
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
                disabled={isLoading || searchIndex.length === 0}
              >
                Send
                {isLoading && <Spinner className="flex ml-1" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
      {seeDebugSearchResult && <div className="flex flex-col overflow-auto max-h-[80vh] h-[80vh] ml-4">
        {debugSearchResult && <JsonView
          data={debugSearchResult}
          shouldExpandNode={collapseAllNested}
          style={darkStyles}
        />}
        {debugPrompt && <span>Debug Prompt: {debugPrompt}</span>}
        
        
      </div>}
    </div>
  )
}

export default RAGChat
