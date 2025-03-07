'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DocumentPipelineResponse } from '@/app/api/pipeline/types'

export default function DocumentList() {
  const [documents, setDocuments] = useState<DocumentPipelineResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/pipeline/document')
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchDocuments} 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
        <p className="text-gray-600">No documents found in the pipeline.</p>
        <p className="text-sm text-gray-500 mt-1">Upload a document to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Documents in Pipeline</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchDocuments}
        >
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{doc.fileName}</CardTitle>
              <CardDescription>
                Uploaded: {new Date(doc.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">ID:</span> {doc.id}
                </p>
                {doc.metadata && (
                  <div className="text-sm">
                    <span className="font-medium">File Type:</span> {(doc.metadata as any).fileType || 'Unknown'}
                    <br />
                    <span className="font-medium">Size:</span> {formatFileSize((doc.metadata as any).fileSize || 0)}
                  </div>
                )}
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/documentPipeline/${doc.id}`, '_blank')}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
