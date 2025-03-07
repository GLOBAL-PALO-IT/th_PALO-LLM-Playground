'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { DocumentPipelineResponse } from '@/app/api/pipeline/types'
import { formatDate } from '@/lib/utils'

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [document, setDocument] = useState<DocumentPipelineResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/pipeline/document/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch document')
        }
        
        const data = await response.json()
        setDocument(data)
      } catch (err) {
        setError('Error loading document details')
        console.error('Error fetching document:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [params.id])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading document details...</span>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Document not found'}</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/documentPipeline')}
            >
              Back to Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metadata = document.metadata as any || {}

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Document Details</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/documentPipeline')}
        >
          Back to Documents
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{document.fileName}</CardTitle>
          <CardDescription>
            Created: {formatDate(document.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Document Information</h3>
              <div className="space-y-1">
                <p><span className="font-medium">ID:</span> {document.id}</p>
                <p><span className="font-medium">File Name:</span> {document.fileName}</p>
                <p><span className="font-medium">Created:</span> {formatDate(document.createdAt)}</p>
                <p><span className="font-medium">Last Updated:</span> {formatDate(document.updatedAt)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Metadata</h3>
              <div className="space-y-1">
                {metadata.fileType && (
                  <p><span className="font-medium">File Type:</span> {metadata.fileType}</p>
                )}
                {metadata.fileSize && (
                  <p><span className="font-medium">Size:</span> {formatFileSize(metadata.fileSize)}</p>
                )}
                {metadata.pages && (
                  <p><span className="font-medium">Pages:</span> {metadata.pages}</p>
                )}
                {metadata.wordCount && (
                  <p><span className="font-medium">Word Count:</span> {metadata.wordCount}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Document Content</TabsTrigger>
          <TabsTrigger value="translation">
            Translation Pipelines ({document.TranslationPipeline?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="enrichment">
            Enrichment Pipelines ({document.EnrichmentPipeline?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="evaluation">
            Evaluation Pipelines ({document.EvaluationPipeline?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
            </CardHeader>
            <CardContent>
              {document.content ? (
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] whitespace-pre-wrap">
                  {typeof document.content === 'string' 
                    ? document.content 
                    : JSON.stringify(document.content, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No content available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="translation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              {document.TranslationPipeline && document.TranslationPipeline.length > 0 ? (
                <div className="space-y-4">
                  {document.TranslationPipeline.map((pipeline) => (
                    <Card key={pipeline.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{pipeline.fileName}</CardTitle>
                        <CardDescription>
                          {pipeline.page ? `Page ${pipeline.page}` : 'No page specified'} • 
                          Created: {formatDate(pipeline.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Input</h4>
                            <div className="bg-gray-100 p-3 rounded-md">
                              <p className="whitespace-pre-wrap">{pipeline.input}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Output</h4>
                            <div className="bg-gray-100 p-3 rounded-md">
                              <p className="whitespace-pre-wrap">{pipeline.output || 'No output yet'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No translation pipelines available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="enrichment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrichment Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              {document.EnrichmentPipeline && document.EnrichmentPipeline.length > 0 ? (
                <div className="space-y-4">
                  {document.EnrichmentPipeline.map((pipeline) => (
                    <Card key={pipeline.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{pipeline.fileName}</CardTitle>
                        <CardDescription>
                          {pipeline.page ? `Page ${pipeline.page}` : 'No page specified'} • 
                          Created: {formatDate(pipeline.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Input</h4>
                            <div className="bg-gray-100 p-3 rounded-md">
                              <p className="whitespace-pre-wrap">{pipeline.input}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Output</h4>
                            <div className="bg-gray-100 p-3 rounded-md">
                              <p className="whitespace-pre-wrap">
                                {pipeline.output 
                                  ? (typeof pipeline.output === 'string' 
                                      ? pipeline.output 
                                      : JSON.stringify(pipeline.output, null, 2))
                                  : 'No output yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No enrichment pipelines available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="evaluation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              {document.EvaluationPipeline && document.EvaluationPipeline.length > 0 ? (
                <div className="space-y-4">
                  {document.EvaluationPipeline.map((pipeline) => (
                    <Card key={pipeline.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{pipeline.fileName}</CardTitle>
                        <CardDescription>
                          {pipeline.page ? `Page ${pipeline.page}` : 'No page specified'} • 
                          Created: {formatDate(pipeline.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Input</h4>
                              <div className="bg-gray-100 p-3 rounded-md">
                                <p className="whitespace-pre-wrap">{pipeline.input}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Output</h4>
                              <div className="bg-gray-100 p-3 rounded-md">
                                <p className="whitespace-pre-wrap">{pipeline.output}</p>
                              </div>
                            </div>
                          </div>
                          
                          {pipeline.question && (
                            <div>
                              <h4 className="font-semibold mb-2">Question</h4>
                              <div className="bg-gray-100 p-3 rounded-md">
                                <p className="whitespace-pre-wrap">{pipeline.question}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pipeline.grounded_context && (
                              <div>
                                <h4 className="font-semibold mb-2">Grounded Context</h4>
                                <div className="bg-gray-100 p-3 rounded-md">
                                  <p className="whitespace-pre-wrap">{pipeline.grounded_context}</p>
                                </div>
                              </div>
                            )}
                            
                            {pipeline.grounded_answer && (
                              <div>
                                <h4 className="font-semibold mb-2">Grounded Answer</h4>
                                <div className="bg-gray-100 p-3 rounded-md">
                                  <p className="whitespace-pre-wrap">{pipeline.grounded_answer}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pipeline.llm_answer && (
                              <div>
                                <h4 className="font-semibold mb-2">LLM Answer</h4>
                                <div className="bg-gray-100 p-3 rounded-md">
                                  <p className="whitespace-pre-wrap">{pipeline.llm_answer}</p>
                                </div>
                              </div>
                            )}
                            
                            {pipeline.llm_score !== null && pipeline.llm_score !== undefined && (
                              <div>
                                <h4 className="font-semibold mb-2">LLM Score</h4>
                                <div className="bg-gray-100 p-3 rounded-md">
                                  <p className="text-xl font-bold">{pipeline.llm_score}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No evaluation pipelines available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
