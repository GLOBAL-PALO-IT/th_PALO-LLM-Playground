import { NextResponse } from 'next/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from '@langchain/core/documents'
import { ChatOpenAI } from "@langchain/openai";
import { LLMGraphTransformer } from "@langchain/community/experimental/graph_transformers/llm";
import { ModelName } from '@/lib/utils';
import "neo4j-driver";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { ChatPromptTemplate } from "@langchain/core/prompts";

interface Node {
  id: string | number;
  type: string;
  properties: Record<string, any>;
}
interface GraphResult {
  nodes: {
    id: string | number;
    type: string;
    properties: Record<string, any>;
  }[];
  relationships: {
    source: Node;
    target: Node;
    type: string;
    properties: Record<string, any>;
  }[];
}
export async function POST(req: Request) {
  const formData = await req.formData()
  const pdfFile = formData.get('pdf') as File
  const targetNodes = JSON.parse(formData.get('targetNodes') as string)
  const targetRelationships = JSON.parse(formData.get('targetRelationships') as string)
  //Blob of pdfFile
  const pdfBlob = new Blob([pdfFile], { type: pdfFile.type })

  console.log('pdfFile', pdfFile)
  if (!pdfFile) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }


  try {
    //Load PDF
    const loader = new PDFLoader(pdfBlob)
    const docs: Document<Record<string, any>>[] = await loader.load()
    //Initialize Graph
    const url = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;
    // if either url, username, password is undefined throw error "Neo4j env vars are not defined"
    if (!url || !username || !password) {
      throw new Error("Neo4j env vars are not defined");
    }
    const graph = await Neo4jGraph.initialize({ url, username, password });
    //Transform PDF to Graph
    //Initialize LLM and Graph Transformer
    const model = new ChatOpenAI({
      temperature: 0,
      model: ModelName.GPT4O,
    });

    const llmGraphTransformer = new LLMGraphTransformer({
      llm: model,
      allowedNodes: targetNodes,
      allowedRelationships: targetRelationships
    });


    console.log('docs length', docs.length)
    //start time lapse
    const startTime = Date.now();
    let combinedResult: GraphResult[] = []
    for (let i = 0; i < docs.slice(50, 55).length; i++) {
      console.log('start transforming for doc', i)
      const result = await llmGraphTransformer.convertToGraphDocuments([docs[i]]);
      
      combinedResult.push({
        nodes: result[0].nodes.map((node) => {
          return {
            id: node.id,
            type: node.type,
            properties: node.properties
          }
        }),
        relationships: result[0].relationships.map((relationship) => {
          return {
            source: {
              id: relationship.source.id,
              type: relationship.source.type,
              properties: relationship.source.properties
            },            
            target: {
              id: relationship.target.id,
              type: relationship.target.type,
              properties: relationship.target.properties
            },
            type: relationship.type,
            properties: relationship.properties
          }
        })
      })
      await graph.addGraphDocuments(result);
    }

    //end time lapse
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    console.log(`Time taken: ${elapsedTime} ms`);
    console.log({ combinedResult })

    return NextResponse.json({ graphResult: combinedResult }, { status: 200 })
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
