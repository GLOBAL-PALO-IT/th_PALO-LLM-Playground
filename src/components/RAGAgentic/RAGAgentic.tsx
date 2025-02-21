'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

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
  collapseAllNested,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { Input } from '@/components/ui/input'
import IndexesDropDown from './IndexesDropDown'

const RAGAgentic = () => {
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [searchIndex, setSearchIndex] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [collections, setCollections] = useState<string[]>([])
  const [debugPrompt, setDebugPrompt] = useState<string>('')
  const [debugSearchResult, setDebugSearchResult] = useState()
  const [intermediateSteps, setIntermediateSteps] = useState()
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

    setIsLoading(true)

    try {
      const response = await fetch('/api/ragAgentic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [newMessage], searchIndex }),
      })
      const { message, prompt, searchResult, intermediateSteps }:
        {
          message: ChatCompletionMessageParam,
          prompt: string,
          searchResult: any,
          intermediateSteps: any
        } = await response.json()
      setDebugPrompt(prompt)
      setDebugSearchResult(searchResult)
      setOutput(message.content as string)
      setIntermediateSteps(intermediateSteps)
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
    <div className="flex flex-col">
      <h1 className="text-xl font-bold p-4">Agentic RAG with {searchIndex}</h1>
      <div className="p-4 flex flex-row content-center items-center">
        {collections.length > 0 && <IndexesDropDown setInput={setSearchIndex} collections={collections} />}
        <div className="ml-5 flex flex-row space-x-2"><span>Search Knowledge:</span> <span className="font-bold">{searchIndex}</span></div>
      </div>
      <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
        <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Question</h3>
          <Textarea
            placeholder="Enter your question here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-4"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-500 items-center justify-center"
            disabled={isLoading}
          >
            Generate Answer
            {isLoading && <Spinner className="flex ml-1" />}
          </Button>
          <h3 className="text-xl font-bold mt-8">Answer</h3>
          <div className='whitespace-pre-wrap'>
            <ReactMarkdown>
              {output}
            </ReactMarkdown>
          </div>

        </Card>
        {/* <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Context</h3>
          <div className='whitespace-pre-wrap'>
            <ReactMarkdown>
              {debugPrompt}
            </ReactMarkdown>
          </div>
        </Card> */}
        <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Intermediate Steps</h3>
          {intermediateSteps && <JsonView
            data={intermediateSteps}
            shouldExpandNode={collapseAllNested}
            style={darkStyles}
          />}
        </Card>
        {/* <Card className="p-4 w-full overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Search Result</h3>
          {debugSearchResult && <JsonView
            data={debugSearchResult}
            shouldExpandNode={collapseAllNested}
            style={darkStyles}
          />}
        </Card> */}
      </div>

    </div>
  )
}

export default RAGAgentic
