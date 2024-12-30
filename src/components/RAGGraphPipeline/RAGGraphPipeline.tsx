'use client'
import React, { useState, useCallback, useEffect } from 'react'
import neo4j, { Node, Relationship } from 'neo4j-driver'
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
import { Plus, X } from "lucide-react";
interface GraphDocument {
  nodes: Node[];
  relationships: Relationship[];
  source: Document;
  lc_namespace: string[];
}
const RAGGraphPipeline = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [graphContent, setGraphContent] = useState<GraphDocument[]>(
    []
  )
//Person, Title, Experience, Certification, Skills
  const [targetNodesItems, setTargetNodesItems] = useState<string[]>(['Person', 'Title', 'Experience', 'Certification', 'Skills'])
//'Obtain, Has Title, Has Skill, Has Experience'
  const [targetRelationshipsItems, setTargetRelationshipsItems] = useState<string[]>(['Obtain', 'Has Title', 'Has Skill', 'Has Experience'])
  const [neo4jConnection, setNeo4jConnection] = useState<string>('')
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
      setNeo4jConnection(JSON.stringify(serverInfo))
    } catch (err) {
      console.log(`Connection error\n${err}\nCause: ${err}`)
    }
  }, [])
  const runQuery = async (query: string) => {
    if (!query || query === '') return
    setIsLoading(true)
    try {
      const URI = 'neo4j://localhost:7687'
      const USER = 'neo4j'
      const PASSWORD = 'yourpassword'
      let driver
      driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
      const session = driver.session()
      const result = await session.run(query)

      console.log('Result Records: ', result.records)
      driver.close()
      //Transform result to string for both NodeLabels and RelationshipTypes
      const resultString = result.records.map((record) => record.get(0)).join(', ')
      console.log({ resultString })
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
      //replace all " " with "_"
      formData.append('targetNodes', JSON.stringify(targetNodesItems).toUpperCase().replace(/ /g, '_'))
      formData.append('targetRelationships', JSON.stringify(targetRelationshipsItems).toUpperCase().replace(/ /g, '_'))

      const response = await fetch(`/api/graph/pdfToGraph`, {
        method: 'POST',
        body: formData,
      })

      const { graphResult } = await response.json()
      console.log({ graphResult })
      setGraphContent(graphResult)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    connectNeo4j()
  }, [connectNeo4j])

  //Nodes
  const handleTargetNodeChange = (index: number, value: string) => {
    const newItems = [...targetNodesItems];
    newItems[index] = value.toUpperCase().replace(/ /g, '_');
    setTargetNodesItems(newItems);
  };

  const addTargetNodeItem = () => {
    setTargetNodesItems([...targetNodesItems, '']);
  };

  const removeTargetNodeItem = (index: number) => {
    const newItems = targetNodesItems.filter((_, i) => i !== index);
    setTargetNodesItems(newItems);
  };
  //Relationships
  const handleTargetRelationshipChange = (index: number, value: string) => {
    const newItems = [...targetRelationshipsItems];
    newItems[index] = value.toUpperCase().replace(/ /g, '_');
    setTargetRelationshipsItems(newItems);
  };

  const addTargetRelationshipItem = () => {
    setTargetRelationshipsItems([...targetRelationshipsItems, '']);
  };

  const removeTargetRelationshipItem = (index: number) => {
    const newItems = targetRelationshipsItems.filter((_, i) => i !== index);
    setTargetRelationshipsItems(newItems);
  };


  return <div className="flex flex-col">
    <div className={`p-4 flex flex-row content-center items-center ${neo4jConnection ? 'text-green-500' : 'text-gray-500'}`}>
      Neo4J Connection: {neo4jConnection}
    </div>
    <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
      {/* Nodes Handling */}
      <Card className="p-4 w-full overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            {targetNodesItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={item.toUpperCase().replace(/ /g, '_')}
                  onChange={(e) => handleTargetNodeChange(index, e.target.value)}
                  placeholder={`Target Node ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTargetNodeItem(index)}
                  disabled={item.length === 1}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={addTargetNodeItem}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Target Node
          </Button>
        </div>
      </Card>
      {/* Relationships Handling */}
      <Card className="p-4 w-full overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            {targetRelationshipsItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={item.toUpperCase().replace(/ /g, '_')}
                  onChange={(e) => handleTargetRelationshipChange(index, e.target.value)}
                  placeholder={`Target Relationship ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTargetRelationshipItem(index)}
                  disabled={item.length === 1}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={addTargetRelationshipItem}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Target Relationship
          </Button>
        </div>
      </Card>
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
              disabled={isLoading || !selectedFile}
            >
              Upload PDF and Construct Graph
            </Button>
          </form>

          {graphContent && (
            <div className="mt-6 max-h-[50vh] overflow-y-auto">
              <h2>Documents Chunk Size {graphContent.length}</h2>
              {graphContent.map((doc, index) => (
                <div key={index} className='cursor-pointer'>
                  <JsonView
                    data={doc}
                    shouldExpandNode={collapseAllNested}
                    style={darkStyles}
                  />
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
