'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from "@/components/ui/checkbox"

import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import React from 'react'
import {
  FaSearch,
  FaRegStickyNote,
  FaQuoteLeft
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
import QuestionDropDown from './QuestionDropDown'
import { questions } from './questions'

const RAGAgentic = () => {
  const [pretext, setPretext] = useState<string>('I am the owner of Isuzu D-Max Maxforce 2025 model.')
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [searchIndex, setSearchIndex] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [collections, setCollections] = useState<string[]>([])
  const [debugPrompt, setDebugPrompt] = useState<string>('')
  const [totalScore,setTotalScore] = useState<number>(0)
  const [debugSearchResult, setDebugSearchResult] = useState()
  const [intermediateSteps, setIntermediateSteps] = useState()
  const [toggleSearch, setToggleSearch] = useState(false)
  const [toggleIntermediateSteps, setToggleIntermediateSteps] = useState(false)
  const [togglePrompt, setTogglePrompt] = useState(false)
  const [webSearch, setWebSearch] = useState(false)
  const [topK, setTopK] = useState(10)
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
      content: `${pretext} ${input}`,
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/ragAgentic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [newMessage], searchIndex, webSearch, topK }),
      })
      const { message, prompt, searchResult, totalScore,intermediateSteps }:
        {
          message: string,
          prompt: string,
          searchResult: any,
          intermediateSteps: any,
          totalScore: number
        } = await response.json()
      setTotalScore(totalScore)
      setDebugPrompt(prompt)
      setDebugSearchResult(searchResult)
      setOutput(typeof message === 'string' ? message : '')
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
      <div className="p-4 flex flex-row content-center items-center">
        {questions.length > 0 && <QuestionDropDown setInput={setInput} />}
        <div className="flex items-center space-x-2 ml-4">
          <Checkbox id="web-search" onCheckedChange={(checked) => setWebSearch(checked ? true : false)} />
          <label
            htmlFor="web-search"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Web Search
            {/* {webSearch.toString()} */}
          </label>
        </div>
        <div className="flex items-center space-x-2 ml-4 content-center items-center">
          <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Top K</h3>
          <Input
            placeholder="Enter your TopK"
            type="number"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-[100px]"
          />
        </div>

      </div>
      <div className='pl-4 flex flex-row content-center items-center' >
        <h3 className="text-sm mb-4 mr-4">Pretext</h3>
        <Input
          placeholder="Enter your pretext"
          value={pretext}
          onChange={(e) => setPretext(e.target.value)}
          className="pl-4 mb-4"
        />
      </div>
      <div className='flex flex-row'>
        <button className='pl-4' onClick={() => setToggleSearch(!toggleSearch)}>
          <FaSearch className="m-1" color="blue-500" />
        </button>
        <button className='pl-2' onClick={() => setToggleIntermediateSteps(!toggleIntermediateSteps)}>
          <FaRegStickyNote className="m-1" color="blue-500" />
        </button>
        {/* FaQuoteLeft */}
        <button className='pl-2' onClick={() => setTogglePrompt(!togglePrompt)}>
          <FaQuoteLeft className="m-1" color="blue-500" />
        </button>
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
          <h3 className="text-xl font-bold mt-8">Answer (Total Score: {totalScore})</h3>
          <div className='whitespace-pre-wrap bg-blue-100 p-3'>
            <ReactMarkdown>
              {output}
            </ReactMarkdown>
          </div>

        </Card>

        {toggleIntermediateSteps && <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Intermediate Steps</h3>
          {intermediateSteps && <JsonView
            data={intermediateSteps}
            shouldExpandNode={collapseAllNested}
            style={darkStyles}
          />}
        </Card>}
        {toggleSearch && <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Search Result</h3>
          {debugSearchResult && <JsonView
            data={debugSearchResult}
            shouldExpandNode={collapseAllNested}
            style={darkStyles}
          />}
        </Card>}
        {togglePrompt && <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Prompt</h3>
          <div className='whitespace-pre-wrap'>
            <ReactMarkdown>
              {debugPrompt}
            </ReactMarkdown>
          </div>
        </Card>}
      </div>

    </div>
  )
}

export default RAGAgentic
