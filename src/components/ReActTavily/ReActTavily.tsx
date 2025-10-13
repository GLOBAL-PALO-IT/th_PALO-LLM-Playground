'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import ReactMarkdown from 'react-markdown'
import { FaSearch, FaRobot, FaLightbulb } from 'react-icons/fa'

interface IntermediateStep {
  action: {
    tool: string
    toolInput: string
    log: string
  }
  observation: string
}

interface ReActResult {
  output: string
  intermediateSteps: IntermediateStep[]
  success: boolean
  error?: string
  details?: string
}

const exampleQueries = [
  'What are the latest developments in AI and machine learning in 2024?',
  'Who won the latest Nobel Prize in Physics and what was their contribution?',
  'What is the current price of Bitcoin and what factors are influencing it?',
  'What are the major climate change initiatives announced this year?',
  'What are the top trending technologies in software development right now?',
]

export default function ReActTavily() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ReActResult | null>(null)

  const handleSearch = async (searchQuery?: string) => {
    const queryToUse = searchQuery || query
    if (!queryToUse.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/runReActWithTavily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        output: '',
        intermediateSteps: [],
        success: false,
        error: 'Failed to fetch results',
        details: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <FaRobot className="text-blue-600" />
            ReAct Agent with Internet Search
          </h1>
          <p className="text-gray-600 text-lg">
            Reasoning and Action principle with Langchain & Tavily
          </p>
        </div>

        <Card className="p-6 mb-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ask a question (will search the internet for current information)
              </label>
              <Textarea
                placeholder="Enter your question here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px] text-base"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Searching and Reasoning...
                </>
              ) : (
                <>
                  <FaSearch className="mr-2" />
                  Search & Answer
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 mb-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Example Queries
          </h3>
          <div className="grid gap-3">
            {exampleQueries.map((exampleQuery, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(exampleQuery)
                  handleSearch(exampleQuery)
                }}
                disabled={isLoading}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm text-gray-700">{exampleQuery}</p>
              </button>
            ))}
          </div>
        </Card>

        {result && (
          <div className="space-y-6">
            {result.error ? (
              <Card className="p-6 bg-red-50 border-red-200">
                <h3 className="text-xl font-semibold text-red-700 mb-2">
                  Error
                </h3>
                <p className="text-red-600">{result.error}</p>
                {result.details && (
                  <pre className="mt-4 p-4 bg-red-100 rounded text-sm overflow-auto">
                    {result.details}
                  </pre>
                )}
              </Card>
            ) : (
              <>
                {result.intermediateSteps && result.intermediateSteps.length > 0 && (
                  <Card className="p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      🧠 Reasoning Process (ReAct Steps)
                    </h3>
                    <div className="space-y-4">
                      {result.intermediateSteps.map((step, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-4 py-2"
                        >
                          <div className="mb-2">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                              Step {index + 1}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="font-semibold text-gray-700 mb-1">
                              💭 Thought & Action:
                            </h4>
                            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto whitespace-pre-wrap">
                              {step.action.log}
                            </pre>
                          </div>

                          <div className="mb-3">
                            <h4 className="font-semibold text-gray-700 mb-1">
                              🔧 Tool: {step.action.tool}
                            </h4>
                            <p className="bg-yellow-50 p-3 rounded text-sm">
                              Input: {step.action.toolInput}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-700 mb-1">
                              👁️ Observation:
                            </h4>
                            <div className="bg-green-50 p-3 rounded text-sm max-h-64 overflow-auto">
                              <ReactMarkdown>{step.observation}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-6 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    ✅ Final Answer
                  </h3>
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{result.output}</ReactMarkdown>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
