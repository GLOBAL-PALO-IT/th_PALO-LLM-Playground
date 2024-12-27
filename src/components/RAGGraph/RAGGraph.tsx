'use client'
import React, { useState, useCallback, useEffect } from 'react'
import neo4j, { Node, Relationship } from 'neo4j-driver'
import { Document } from '@langchain/core/documents'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import IndexesDropDown from './IndexesDropDown'

const RAGGraph = () => {
  const [graphQuery, setGraphQuery] = useState<string>('')
  const [graphDBBrand, setGraphDBBrand] = useState<string>('Neo4J Cypher')
  const [selectedText, setSelectedText] = useState<string>('')
  const [graphDescription, setGraphDescription] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfContent, setPdfContent] = useState<Document<Record<string, any>>[]>(
    []
  )
  const [chunkAPIs, setChunkAPIs] = useState<string[]>(['/uploadPDF', '/uploadPDFByToken'])
  const [targetNodes, setTargetNodes] = useState<string>('Person, Title, Experience, Certification, Skills')
  const [targetRelationships, setTargetRelationships] = useState<string>('Obtain, Has Title, Has Skill, Has Experience')
  const [selectedChunkAPI, setSelectedChunkAPI] = useState<string>('/uploadPDF')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  
  const [searchResult, setSearchResult] = useState<string>()

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
 const nodesQuery = 'MATCH (n) RETURN DISTINCT labels(n) AS NodeLabels'
 const relationshipsQuery = 'MATCH ()-[r]->() RETURN DISTINCT type(r) AS RelationshipTypes'

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
  //Describe Graph
  const describeGraph = async (text: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/graph/describe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetNodes, targetRelationships }),
      });
      const { graph } = await response.json();
      console.log({ graph });
      setGraphDescription(graph)
    }
    catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  //Create Graph
  const createGraph = async (name: string, graph: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/graph/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, graph, targetNodes, targetRelationships }),
      });
      const { query } = await response.json();
      console.log({ query });
      setGraphQuery(query)
    }
    catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  //Generate Search Query
  const generateSearchQuery = async (question: string) => {
    if(!question || question === '') return
    setIsLoading(true)
    const nodeLabels = await runQuery(nodesQuery)
    const relationshipTypes = await runQuery(relationshipsQuery)
    console.log({ nodeLabels, relationshipTypes })
    try {
      const response = await fetch('/api/graph/searchQuery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question,name: graphDBBrand, description: `Node Labels: ${nodeLabels}, Relationship Types: ${relationshipTypes}` }),
      });
      const { query } = await response.json();
      console.log({ query });
      setSearchQuery(query)
    }
    catch (e) {
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
          <h3 className="text-xl font-bold mb-4">Selected Text </h3>
          <Textarea
            placeholder="Enter your Text Here"
            value={selectedText}
            onChange={(e) => {
              setSelectedText(e.target.value)
            }}
            className="mb-4 h-[300px]"
            disabled={isLoading}
          />
        </div>
      </Card>
      <Card className="p-4 w-full overflow-y-auto">
      <Button
            onClick={() => describeGraph(selectedText)}
            key="create-graph"
            className="w-full bg-blue-800 mt-4"
            disabled={isLoading}
          >
            Create Graph Description
          </Button>
          <h3 className="text-xl font-bold mb-4 mt-6">Graph Description</h3>
          <div>
            <span
              className='text-sm text-gray-500 whitespace-pre-wrap w-full mb-6'
            >{graphDescription}</span>
          </div>
        <h3 className="text-xl font-bold mb-4 mt-6">Graph Query</h3>
        {/* Text Input of Different Brand of Graph DB */}
        <Input
          placeholder="Enter Graph DB Name"
          className="mb-4"
          value={graphDBBrand}
          onChange={(e) => {
            setGraphDBBrand(e.target.value)
          }} />
        {/* Generate Graph Query Button */}
        <Button
          onClick={() => createGraph(graphDBBrand, graphDescription)}
          key="create-graph-query"
          className="w-full bg-blue-800 mt-4"
          disabled={isLoading}
        >
          Create Graph Query
        </Button>
        {/* Query Result */}
        <h3 className="text-xl font-bold mb-4 mt-6">Graph Query Result </h3>
        <div>
          <span
            className='text-sm text-gray-500 whitespace-pre-wrap w-full mb-6'
          >{graphQuery}</span>
        </div>
        <h3 className="text-xl font-bold mb-4 mt-6">Run Graph Query</h3>
        <Button
          onClick={() => runQuery(graphQuery)}
          key="run-search"
          className="w-full bg-blue-800 mt-4"
          disabled={isLoading}
        >
          Run Graph Query
        </Button>
      </Card>
      <Card className="p-4 w-full overflow-y-auto flex flex-col">
        <h3 className="text-xl font-bold mb-4">Question</h3>
        <Input
          placeholder="Enter your question here"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mb-4"
        />
        <h3 className="text-xl font-bold mb-4">Transform Question to Query</h3>
        <Button
          onClick={() => generateSearchQuery(question)}
          key="generate-search-query"
          className="w-full bg-blue-800 mt-4"
          disabled={isLoading || question === ''}
        >
          Generate Search Query
        </Button>
        <span
          className='text-sm text-gray-500 whitespace-pre-wrap w-full mb-6 mt-6'
        >{searchQuery}</span>
        <h3 className="text-xl font-bold mb-4">Run Search Query</h3>
        <Button
          onClick={async () => {
            const result = await runQuery(searchQuery)
            setSearchResult(result)
          }}
          key="run-search-query"
          className="w-full bg-blue-800 mt-4"
          disabled={isLoading}
        >
          Run Search Query
        </Button>
        <span
          className='text-sm text-gray-500 whitespace-pre-wrap w-full mb-6 mt-6'
        >{searchResult}</span>
      </Card>
    </div>
    <div className="p-4 flex flex-row content-center items-center"></div>
  </div>
}

export default RAGGraph
