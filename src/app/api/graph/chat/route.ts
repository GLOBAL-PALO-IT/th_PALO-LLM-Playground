import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'

import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import "neo4j-driver";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { GraphCypherQAChain } from "@langchain/community/chains/graph_qa/cypher";
import { ChatOpenAI } from "@langchain/openai";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { OpenAIEmbeddings } from "@langchain/openai";
export async function POST(request: Request) {
    const { messages }: { messages: ChatCompletionMessageParam[]; } =
        await request.json()
    const latestMessage = messages[messages.length - 1]
    if (!latestMessage.content) {
        return NextResponse.json({ output: 'Message content cannot be empty' }, { status: 400 })
    }
    const query = latestMessage.content as string
    //Initialize Graph
    const url = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;
    if (!url || !username || !password) {
        return NextResponse.json({ error: "Neo4j environment variables are not configured. Please set NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD." }, { status: 500 });
    }
    // Configuration object for Neo4j connection and other related settings
    const config = {
        url: url, // URL for the Neo4j instance
        username: username, // Username for Neo4j authentication
        password: password, // Password for Neo4j authentication
    };
    const graph = await Neo4jGraph.initialize(config);
    await graph.refreshSchema();
    // console.log({ schema: graph.getSchema() });
    try {
        const llm = new ChatOpenAI({ model: ModelName.GPT4O, temperature: 0 });
        const chain = GraphCypherQAChain.fromLLM({
            llm,
            graph,
            returnIntermediateSteps: true,
        });
        // Get Neo4j vector store
        const {rawText, docs} = await getContextFromNeo4jVectorStore(config, query)
        const response = await chain.invoke({
            query: `Documents with Properties: ${rawText}\n${query}`
        });
        // console.log({ response });
        return NextResponse.json({ chainResponse: response, rawText, docs })
    }
    catch (error: any) {
        return NextResponse.json({ output: error.message }, { status: 500 })
    }
}

const getContextFromNeo4jVectorStore = async (config: any, query: string) => {
    try {
        config = {
            ...config,
            indexName: "Document",
            nodeLabel: "Document",
            textNodeProperty: "text",
            textNodeProperties: ["text"],
            embeddingNodeProperty: "embedding",
            searchType: "vector" as const,
        }
        const neo4jVectorIndex = await Neo4jVectorStore.initialize(
            new OpenAIEmbeddings(),
            config,
        );
        const searchResults = await neo4jVectorIndex.similaritySearch(query, 10);
        console.log({ query, searchResults })
        const rawText = searchResults.map((result, index) => {
            return `<${index + 1}><text>${result.pageContent}</text><pageNumber>${result.metadata.pageNumber}</pageNumber></${index + 1}>`
        }).join('')
        return {rawText, docs: searchResults}
    } catch (e) {
        console.error(e)
        return {rawText: '', docs: []}
    }

}