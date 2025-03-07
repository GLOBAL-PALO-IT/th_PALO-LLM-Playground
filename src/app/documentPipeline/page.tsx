'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import DocumentList from '@/components/DocumentPipeline/DocumentList'

export default function DocumentPipelinePage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean
    message: string
    documentId?: string
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setUploadStatus({
        success: false,
        message: 'Please select a file to upload'
      })
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', fileName)
      
      const response = await fetch('/api/pipeline/document/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const data = await response.json()
      
      setUploadStatus({
        success: true,
        message: 'Document uploaded successfully!',
        documentId: data.id
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      setUploadStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Document Pipeline</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload a document to process through the document pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="file" className="block text-sm font-medium mb-2">
                  Select Document
                </label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
              
              <div>
                <label htmlFor="fileName" className="block text-sm font-medium mb-2">
                  File Name (optional)
                </label>
                <Input
                  id="fileName"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Custom file name (defaults to original filename)"
                  className="w-full"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {uploadStatus && (
                <p className={`text-sm ${uploadStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                  {uploadStatus.message}
                </p>
              )}
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={isUploading || !file}
              className="ml-auto"
            >
              {isUploading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </CardFooter>
        </Card>

        {uploadStatus?.success && uploadStatus.documentId && (
          <Card>
            <CardHeader>
              <CardTitle>Document Uploaded</CardTitle>
              <CardDescription>
                Your document has been uploaded to the pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Document ID: <code className="bg-gray-100 p-1 rounded">{uploadStatus.documentId}</code>
              </p>
              <p className="text-sm mt-2">
                You can now use this document in the document pipeline for processing.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFile(null)
                  setFileName('')
                  setUploadStatus(null)
                }}
              >
                Upload Another Document
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle>Document Pipeline</CardTitle>
            <CardDescription>
              View and manage documents in the pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
