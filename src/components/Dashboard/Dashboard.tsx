'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Example {
  id: string
  title: string
  description: string
  path: string
  category: string
}

const examples: Example[] = [
  // Agents Category
  {
    id: 'react',
    title: 'Shell Agent',
    description: 'Shell Agent that can work with shell script and support complex query such as coding and DevOps. Executes shell scripts server-side.',
    path: '/react',
    category: 'Agents',
  },
  {
    id: 'reactSearch',
    title: 'ReAct with Internet Search',
    description: 'ReAct Agent demonstrating Reasoning and Action principle with Langchain Tavily for internet search.',
    path: '/reactSearch',
    category: 'Agents',
  },
  {
    id: 'reactUiBuilder',
    title: 'UI Builder Agent',
    description: 'Agent for helping to build UI with custom component library.',
    path: '/reactUiBuilder',
    category: 'Agents',
  },
  // Chat Category
  {
    id: 'chat',
    title: 'Basic Chat',
    description: 'Basic OpenAI Chat API usage example showing how messages work in the chat.',
    path: '/chat',
    category: 'Chat',
  },
  {
    id: 'chatWithTools',
    title: 'Chat With Tools',
    description: 'Calling book database. Chat is becoming an Agent with tool-calling capabilities.',
    path: '/chatWithTools',
    category: 'Chat',
  },
  {
    id: 'chatInsurance',
    title: 'Chat With Insurance API',
    description: 'Calling insurance API (clients, claims, policies, payments). Agent connecting to real-world data.',
    path: '/chatInsurance',
    category: 'Chat',
  },
  {
    id: 'chatMenu',
    title: 'Chat Menu Suggestions',
    description: 'Chat that can suggest menus based on user preferences.',
    path: '/chatMenu',
    category: 'Chat',
  },
  {
    id: 'chatVoice',
    title: 'Chat Voice',
    description: 'OpenAI Realtime Voice Chat using speech-to-speech API with Live Kit.',
    path: '/chatVoice',
    category: 'Chat',
  },
  {
    id: 'phoneCall',
    title: 'Phone Call',
    description: 'Calling real phone numbers with AI integration.',
    path: '/phoneCall',
    category: 'Chat',
  },
  // RAG Category
  {
    id: 'ragRawChunk',
    title: 'RAG Chunking Raw Text',
    description: 'Shows how to chunk raw text into smaller pieces and embed them. Demonstrates basic RAG chunking.',
    path: '/ragRawChunk',
    category: 'RAG',
  },
  {
    id: 'ragQdrant',
    title: 'RAG with Qdrant',
    description: 'Shows how chunking works with Qdrant for similarity search. Requires Qdrant docker to start.',
    path: '/ragQdrant',
    category: 'RAG',
  },
  {
    id: 'ragChat',
    title: 'RAG with Chat',
    description: 'Shows how to integrate RAG with Chat by fetching data from Qdrant and passing context to Chat API.',
    path: '/ragChat',
    category: 'RAG',
  },
  {
    id: 'ragGraph',
    title: 'Graph RAG',
    description: 'Showcase of Graph RAG Construction for advanced retrieval patterns.',
    path: '/ragGraph',
    category: 'RAG',
  },
  {
    id: 'ragGraphPipeline',
    title: 'Graph RAG Pipeline',
    description: 'Showcase of Graph RAG Construction Pipeline using LangChain.',
    path: '/ragGraphPipeline',
    category: 'RAG',
  },
  {
    id: 'ragChatGraph',
    title: 'Graph RAG Chat',
    description: 'Showcase of Graph RAG Chat combining graph structures with conversational AI.',
    path: '/ragChatGraph',
    category: 'RAG',
  },
  {
    id: 'ragAgentic',
    title: 'Agentic RAG',
    description: 'Showcase of Agentic RAG where the agent decides when to retrieve information.',
    path: '/ragAgentic',
    category: 'RAG',
  },
  {
    id: 'sentenceSim',
    title: 'Sentence Similarity',
    description: 'Showcase of Sentence Similarity for semantic search and matching.',
    path: '/sentenceSim',
    category: 'RAG',
  },
  // Evaluation Category
  {
    id: 'documentPipeline',
    title: 'Document Pipeline',
    description: 'Document Pipeline for processing and evaluating documents.',
    path: '/documentPipeline',
    category: 'Evaluation',
  },
]

const categories = ['All', 'Agents', 'Chat', 'RAG', 'Evaluation']

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredExamples = examples.filter((example) => {
    const matchesSearch = 
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || example.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PALO LLM Playground
          </h1>
          <p className="text-gray-600 text-lg">
            Explore 20+ LLM examples across Agents, Chat, RAG, and Evaluation
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-4">
            <Input
              type="text"
              placeholder="Search examples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-center gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="min-w-[100px]"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExamples.map((example) => (
            <Card key={example.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{example.title}</CardTitle>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {example.category}
                  </span>
                </div>
                <CardDescription className="text-sm">
                  {example.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={example.path}>
                  <Button className="w-full">
                    Try it out →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredExamples.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No examples found matching your search.</p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          Showing {filteredExamples.length} of {examples.length} examples
        </div>
      </div>
    </div>
  )
}
