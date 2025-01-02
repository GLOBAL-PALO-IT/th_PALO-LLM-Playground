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
  const allowedNodes: string[] | undefined = formData.get('allowedNodes') ? JSON.parse(formData.get('allowedNodes') as string) : []
  const allowedRelationships: string[] | undefined = formData.get('allowedRelationships') ? JSON.parse(formData.get('allowedRelationships') as string) : []
  const fromPage = JSON.parse(formData.get('fromPage') as string)
  const toPage = JSON.parse(formData.get('toPage') as string)
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

    const llmGraphParams = {
      llm: model,
      allowedNodes: allowedNodes && allowedNodes?.length > 0?allowedNodes:undefined,
      allowedRelationships: allowedRelationships && allowedRelationships?.length > 0?allowedRelationships:undefined
    }

    console.log({llmGraphParams})

    const llmGraphTransformer = new LLMGraphTransformer(llmGraphParams);


    console.log('docs length', docs.length)
    //start time lapse
    const startTime = Date.now();
    let combinedResult: GraphResult[] = []
    //TODO: use Promise.all() instead
    for (let i = fromPage; i < toPage; i++) {
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
      //TODO: use Promise.all() instead
      await graph.addGraphDocuments(result);
    }

    //end time lapse
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    //in seconds
    console.log(`Time taken: ${elapsedTime / 1000} seconds`);
    console.log({ combinedResult })

    return NextResponse.json({ graphResult: combinedResult }, { status: 200 })
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
