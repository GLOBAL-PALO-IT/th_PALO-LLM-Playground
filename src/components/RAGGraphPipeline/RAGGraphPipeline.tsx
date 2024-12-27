'use client'
import React, { useState, useCallback, useEffect } from 'react'
import neo4j, { Node, Relationship } from 'neo4j-driver'
import { Document } from '@langchain/core/documents'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import IndexesDropDown from './IndexesDropDown'

const RAGGraphPipeline = () => {
  const [selectedText, setSelectedText] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfContent, setPdfContent] = useState<Document<Record<string, any>>[]>(
    []
  )
  const [chunkAPIs, setChunkAPIs] = useState<string[]>(['/uploadPDF', '/uploadPDFByToken'])
  const [targetNodes, setTargetNodes] = useState<string>('Person, Title, Experience, Certification, Skills')
  const [targetRelationships, setTargetRelationships] = useState<string>('Obtain, Has Title, Has Skill, Has Experience')
  const [selectedChunkAPI, setSelectedChunkAPI] = useState<string>('/uploadPDF')

  const connectNeo4j = useCallback(async () => {
    const URI = 'neo4j://localhost:7687'
    const USER = 'neo4j'
    const PASSWORD = 'yourpassword'
    let driver
    try {
      driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
      const serverInfo = await driver.getServerInfo()
      console.log('Connection established')
      console.log(serverInfo)
    } catch (err) {
      console.log(`Connection error\n${err}\nCause: ${err}`)
    }
  }, [])
  const runQuery = async (query: string) => {
    if(!query || query === '') return
    setIsLoading(true)
    try {
      const URI = 'neo4j://localhost:7687'
      const USER = 'neo4j'
      const PASSWORD = 'yourpassword'
      let driver
      driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
      const session = driver.session()
      const result = await session.run(query)
      
      console.log('Result Records: ',result.records)
      driver.close()
      //Transform result to string for both NodeLabels and RelationshipTypes
      const resultString = result.records.map((record) => record.get(0)).join(', ')
      console.log({resultString})
      return resultString
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }


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

      const response = await fetch(`/api${selectedChunkAPI}`, {
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

  useEffect(() => {
    connectNeo4j()
  }, [connectNeo4j])


  return <div className="flex flex-col">
    <div className="p-4 flex flex-row content-center items-center"></div>
    <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
      <Card className="p-4 w-full overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-4">Target Nodes</h3>
          <Input
            placeholder="Enter collection name"
            className="mb-4"
            value={targetNodes}
            onChange={(e) => {
              setTargetNodes(e.target.value)
            }}
          />
          <h3 className="text-xl font-bold mb-4">Target Relationship</h3>
          <Input
            placeholder="Enter collection name"
            className="mb-4"
            value={targetRelationships}
            onChange={(e) => {
              setTargetRelationships(e.target.value)
            }}
          />
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
          {chunkAPIs.length > 0 && <IndexesDropDown setInput={setSelectedChunkAPI} collections={chunkAPIs} selectedCollection={selectedChunkAPI} />}

          {pdfContent && selectedText.length === 0 && (
            <div className="mt-6 max-h-[50vh] overflow-y-auto">
              <h2>Documents Chunk Size {pdfContent.length}</h2>
              {pdfContent.map((doc, index) => (
                <div key={index} className='cursor-pointer' onClick={() => setSelectedText(doc.pageContent)}>
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
    <div className="p-4 flex flex-row content-center items-center"></div>
  </div>
}

export default RAGGraphPipeline
