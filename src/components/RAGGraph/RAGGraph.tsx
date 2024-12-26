'use client'
import React, { use, useCallback, useEffect } from 'react'
import { useState } from 'react'
import { Document } from '@langchain/core/documents'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  JsonView,
  allExpanded,
  collapseAllNested,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { Textarea } from '@/components/ui/textarea'
import OpenAI from 'openai'
import {
  EmbeddingQdrant,
  OperationInfo,
} from '@/app/api/qdrant/insertEmbeddings/route'
import { SearchResult } from '@/app/api/qdrant/searchEmbeddings/route'

const RAGGraph = () => {
  const [query, setQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfContent, setPdfContent] = useState<Document<Record<string, any>>[]>(
    []
  )
  const [collectionName, setCollectionName] = useState<string>('')
  const [targetCollectionName, setTargetCollectionName] = useState<string>('')
  const [collections, setCollections] = useState<string[]>([])

  const [embeddingsSourceDocuments, setEmbeddingsSourceDocuments] = useState<
    OpenAI.Embeddings.Embedding[]
  >([])
  const [embeddingsQuery, setEmbeddingsQuery] = useState<
    OpenAI.Embeddings.Embedding[]
  >([])
  const [searchResult, setSearchResult] = useState<SearchResult>()

  useEffect(() => {
    getCollectionList()
  }, [])

  const insertEmbeddingsSourceDocumentsToVectorDatabase = async () => {
    try {
      setIsLoading(true)
      if (!embeddingsSourceDocuments || !embeddingsSourceDocuments.length)
        return
      const listOfEmbeddingQdrant: EmbeddingQdrant[] =
        embeddingsSourceDocuments.map((embedding, index) => ({
          embedding: embedding.embedding,
          pageContent: pdfContent[index].pageContent,
          metadata: pdfContent[index].metadata,
        }))
      const response = await fetch('/api/qdrant/insertEmbeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName,
          embeddings: listOfEmbeddingQdrant,
        }),
      })

      const { data }: { data: OperationInfo } = await response.json()

      console.log({ insertEmbeddings: data })
    } catch (e) {
      console.error('Error insertEmbeddingsSourceDocumentsToVectorDatabase:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const searchEmbeddings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/qdrant/searchEmbeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName,
          vector: embeddingsQuery[0].embedding,
        }),
      })

      const { data }: { data: SearchResult } = await response.json()

      setSearchResult(data)
    } catch (e) {
      console.error('Error searchEmbeddings:', e)
    } finally {
      setIsLoading(false)
    }
  }

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

  const createCollection = async (
    collectionName: string,
    dimension: number
  ) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/qdrant/createCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionName, dimension }),
      })
      getCollectionList()
    } catch (e) {
      console.error('Error createCollection:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCollection = async (collectionName: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/qdrant/deleteCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionName }),
      })
      getCollectionList()
    } catch (e) {
      console.error('Error deleteCollection:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const getSourceDocumentEmbedding = useCallback(async () => {
    setIsLoading(true)
    try {
      if (pdfContent.length === 0) return
      const response = await fetch('/api/runEmbedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: pdfContent.map((doc) => doc.pageContent),
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
  }, [pdfContent])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true)
    e.preventDefault()
    try {
      if (!selectedFile) return

      const formData = new FormData()
      formData.append('pdf', selectedFile)

      const response = await fetch('/api/uploadPDFByToken', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setPdfContent(data.content)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-row content-center items-center"></div>
      <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
        <Card className="p-4 w-full overflow-y-auto">
          <div className="space-y-4">
            
            <h3 className="text-xl font-bold mb-4">Source Document</h3>
            <form onSubmit={handleSubmit}>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <Button
                type="submit"
                key="run-search"
                className="w-full bg-blue-800 mt-4"
                disabled={isLoading}
              >
                Upload PDF
              </Button>
            </form>

            {pdfContent && (
              <div className="mt-6">
                <h2>Documents Chunk Size {pdfContent.length}</h2>
                {pdfContent.map((doc, index) => (
                  <div key={index}>
                    <h3>{doc.id}</h3>
                    <pre className="p-4 bg-gray-100 rounded whitespace-pre-wrap max-h-[20vh] overflow-auto">
                      {doc.pageContent}
                    </pre>
                    {/* <JsonView
                      data={doc.metadata}
                      shouldExpandNode={collapseAllNested}
                      style={darkStyles}
                    /> */}
                    <hr className="border-t-2 border-blue-900 my-4" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RAGGraph
