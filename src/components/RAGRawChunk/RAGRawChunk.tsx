'use client'
import React, { use, useCallback, useEffect } from 'react'
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import './chat.css'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import OpenAI from 'openai'

import { chunk } from 'llm-chunk'
import { calculateCosineSimilarity } from '@/lib/utils'
import { toast } from "sonner"


import ExamplesDocsDropDown from './ExamplesDocsDropDown'
import ExamplesQuestionDropDown from './ExamplesQuestionDropDown'
import { FaClipboard } from 'react-icons/fa'
const RAGRawChunk = () => {
  const [sourceDocument, setSourceDocument] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [chunks, setChunks] = useState<string[]>([])
  const [systemPrompt, setSystemPrompt] = useState<string>(
    `You are a helpful AI assistant that answer question based on given context in <context>. 
  If you don't know the answer, just say that you don't know.`
  )
  const [context, setContext] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [embeddingsSourceDocuments, setEmbeddingsSourceDocuments] = useState<
    OpenAI.Embeddings.Embedding[]
  >([])
  const [embeddingsQuery, setEmbeddingsQuery] = useState<
    OpenAI.Embeddings.Embedding[]
  >([])
  const [chunksOptions, setChunksOptions] = useState({
    minLength: 200,
    maxLength: 2500,
    splitter: 'paragraph' as 'paragraph',
    overlap: 0,
    delimiters: '\n',
  })
  const [sortedSimilarities, setSortedSimilarities] = useState<
    { similarity: number; index: number }[]
  >([])
  const [topK, setTopK] = useState<number>(5)
  const getCosineSimilarity = useCallback(async () => {
    if (!embeddingsSourceDocuments || !embeddingsQuery) return
    const similarities = embeddingsSourceDocuments?.map((embedding, index) => {
      return {
        similarity: calculateCosineSimilarity(
          embedding.embedding,
          embeddingsQuery[0].embedding
        ),
        index,
      }
    })
    //sort from highest to lowest
    const sortedSimilarities = similarities
      .slice()
      .sort((a, b) => b.similarity - a.similarity)

    setSortedSimilarities(sortedSimilarities)
  }, [embeddingsSourceDocuments, embeddingsQuery])

  const getQueryEmbedding = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!query || query.length === 0) return
      const response = await fetch('/api/runEmbedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: [query],
        }),
      })
      const { embeddings }: { embeddings: OpenAI.Embeddings.Embedding[] } =
        await response.json()

      setEmbeddingsQuery(embeddings)
    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }, [query])
  const getSourceDocumentEmbedding = useCallback(async () => {
    setIsLoading(true)
    try {
      if (chunks.length === 0) return
      const response = await fetch('/api/runEmbedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: chunks,
        }),
      })
      const { embeddings }: { embeddings: OpenAI.Embeddings.Embedding[] } =
        await response.json()

      setEmbeddingsSourceDocuments(embeddings)
    } catch (error: any) {
      console.error('Error getSourceDocumentEmbedding:', error.message)
    } finally {
      setIsLoading(false)
    }
  }, [chunks])

  const handleChunkDocument = () => {
    if (!sourceDocument || sourceDocument.length === 0) {
      setEmbeddingsSourceDocuments([])
      setChunks([])
      return
    }
    setChunks(chunk(sourceDocument, chunksOptions))
  }

  const handleGetSourceEmbedding = () => {
    if (chunks.length === 0) return
    getSourceDocumentEmbedding()
  }

  const handleGetQueryEmbedding = () => {
    if (!query || query.length === 0) return
    getQueryEmbedding()
  }

  useEffect(() => {
    if (!embeddingsQuery || !embeddingsSourceDocuments) return
    if (embeddingsQuery.length === 0 || embeddingsSourceDocuments?.length === 0)
      return
    getCosineSimilarity()
  }, [embeddingsQuery, embeddingsSourceDocuments, getCosineSimilarity])

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold mb-2 mr-2 p-4">RAG Raw Chunking and Prompting</h1>
      <div className="pl-4 pb-2 flex flex-row content-center items-center gap-2">
        <Button
          onClick={handleChunkDocument}
          variant="outline"
          disabled={isLoading || !sourceDocument}
        >
          Chunk Document
        </Button>
        <Button
          onClick={handleGetSourceEmbedding}
          variant="outline"
          disabled={isLoading || chunks.length === 0}
        >
          Get Source Embeddings
        </Button>
        <Button
          onClick={handleGetQueryEmbedding}
          variant="outline"
          disabled={isLoading || !query}
        >
          Get Query Embeddings
        </Button>
        <Button
          onClick={()=>{
            handleGetSourceEmbedding()
            handleGetQueryEmbedding()
          }}
          variant="outline"
          disabled={isLoading || !query || chunks.length === 0}
        >
          Get All Embeddings
        </Button>
      </div>
      <div className="pl-4 flex flex-row content-center items-center">
        <h3 className="text-sm font-bold mr-2">TopK</h3>
        <Input
          placeholder="Enter your top K"
          value={topK}
          type="number"
          onChange={(e) => {
            setTopK(Number(e.target.value.trim()))
          }}
          className="mr-2 w-16"
          disabled={isLoading}
        />
        <h3 className="text-sm font-bold mb-2 mr-2">Delimiter</h3>
        <Input
          placeholder="Enter your delimiter"
          value={chunksOptions.delimiters}
          onChange={(e) => {
            setChunksOptions({
              ...chunksOptions,
              delimiters: e.target.value,
            })
          }}
          className="mb-2 mr-2 w-16"
          disabled={isLoading}
        />
        <h3 className="text-sm font-bold mb-2 mr-2">Min Length</h3>
        <Input
          placeholder="Enter your delimiter"
          value={chunksOptions.minLength}
          type="number"
          onChange={(e) => {
            setChunksOptions({
              ...chunksOptions,
              minLength: Number(e.target.value),
            })
          }}
          className="mb-2 mr-2 w-20"
          disabled={isLoading}
        />
        <h3 className="text-sm font-bold mb-2 mr-2">Max Length</h3>
        <Input
          placeholder="Enter your delimiter"
          value={chunksOptions.maxLength}
          type="number"
          onChange={(e) => {
            setChunksOptions({
              ...chunksOptions,
              maxLength: Number(e.target.value),
            })
          }}
          className="mb-2 mr-2 w-20"
          disabled={isLoading}
        />
      </div>
      <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
        <Card className="p-4 w-full overflow-y-auto">
          <div className="mb-2">
            <ExamplesQuestionDropDown setInput={setQuery} />
          </div>
          <h3 className="text-xl font-bold mb-4">Query</h3>
          <Textarea
            placeholder="Enter your query here"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.trim())
            }}
            className="mb-4"
            disabled={isLoading}
          />
          <div className="mb-2">
            <ExamplesDocsDropDown setInput={setSourceDocument} />
          </div>
          <h3 className="text-xl font-bold mb-4">Source Document</h3>
          <Textarea
            value={sourceDocument}
            onChange={(e) => setSourceDocument(e.target.value)}
            placeholder="Paste your source document here"
            className="w-full h-full"
            disabled={isLoading}
          />
        </Card>
        {(chunks.length > 0) && <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">
            Chunks {chunks.length && chunks.length > 0 ? `(${chunks.length})` : ''}
          </h3>
          {chunks.map((word, index) => (
            <div key={index}>
              <span key={index} className="text-blue-500 whitespace-pre-wrap">
                {word}
              </span>
              <hr />
            </div>
          ))}
        </Card>}
        {(embeddingsSourceDocuments?.length > 0 || embeddingsQuery?.length > 0) && <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Query Embedding</h3>
          <span className="text-sm text-gray-500 whitespace-pre-wrap w-full mb-6">
            {embeddingsQuery?.map((embedding) =>
              embedding.embedding.slice(0, 10).join(', ')
            )}
            ...
          </span>
          <h3 className="text-xl font-bold mb-4 mt-4 whitespace-pre-wrap">
            Source Document Embedding{' '}
            {embeddingsSourceDocuments?.length > 0
              ? embeddingsSourceDocuments.length
              : ''}
          </h3>
          <div className="h-64 overflow-y-auto">
          {embeddingsSourceDocuments?.map((embedding, index) => (
            <div key={index}>
              <span key={index} className="text-blue-500 whitespace-pre-wrap">
                {embedding.embedding.slice(0, 10).join(', ')}...
              </span>
              <hr />
            </div>
          ))}
          </div>
        </Card>}
        {sortedSimilarities?.length > 0 && <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">
            Most Similar Chunk To Query is
          </h3>
          <div className="h-[75vh] overflow-y-auto">
          {sortedSimilarities.slice(0, topK).map((similarity, index) => (
            <div key={index}>
              <span key={index} className="text-blue-500 whitespace-pre-wrap">
                {chunks[similarity.index]?.trim()}
              </span>
              <hr />
            </div>
          ))}
          </div>
        </Card>}
      </div>
      <div className="h-[55vh] p-4 flex flex-row content-center items-center">
        {/* <div className="flex flex-col h-full w-full">
          <h3 className="text-sm font-bold mb-2 mr-2">Context Prompt</h3>
          <Textarea
            placeholder="Your Context Prompt"
            value={sortedSimilarities
              .slice(0, topK)
              .map((similarity, index) => chunks[similarity.index])
              .join('')}
            onChange={(e) => {
              setContext(e.target.value)
            }}
            className="mb-2 mr-2 h-full"
            disabled={isLoading}
          />
        </div> */}
        <div className="flex flex-col h-full w-full ml-4 ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold mr-2">Example System Prompt</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => {
                const text = `<context>${sortedSimilarities
                  .slice(0, topK)
                  .map(
                    (similarity, index) =>
                      `<${index}>${chunks[similarity.index]}</${index}>`
                  )
                  .join('')}</context> ${systemPrompt} \nQuestion: ${query}`;
                navigator.clipboard.writeText(text);
                toast('Text copied to clipboard');
              }}
            >
              <FaClipboard className="mr-1"  size={14}/>
              Copy
            </Button>
          </div>
          <Textarea
            placeholder="Your System Prompt"
            value={`<context>${sortedSimilarities
              .slice(0, topK)
              .map(
                (similarity, index) =>
                  `<${index}>${chunks[similarity.index]}</${index}>`
              )
              .join('')}</context> ${systemPrompt} \nQuestion: ${query}`}
            onChange={(e) => {
              setSystemPrompt(e.target.value)
            }}
            className="mb-2 mr-2 h-full"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default RAGRawChunk
