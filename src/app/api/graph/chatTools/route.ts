import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai';
import z from 'zod';
import { zodFunction } from 'openai/helpers/zod';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import "neo4j-driver";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { searchNeo4Jgraph, searchNeo4JgraphFunction, similaritySearchNeo4Jgraph, similaritySearchNeo4JgraphFunction } from './tools';
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
        throw new Error("Neo4j env vars are not defined");
    }
    // Configuration object for Neo4j connection and other related settings
    const config = {
        url: url, // URL for the Neo4j instance
        username: username, // Username for Neo4j authentication
        password: password, // Password for Neo4j authentication
    };
    const graph = await Neo4jGraph.initialize(config);
    await graph.refreshSchema();
    const schema = await graph.getSchema();
    // console.log({ schema: graph.getSchema() });
    try {
        const openai = new OpenAI();
        const runner = openai.beta.chat.completions
            .runTools({
                model: ModelName.GPT4O,
                // messages: messages,
                messages: [
                    {
                        role: 'user',
                        content: `Tools Guide Steps: 
1. Start with running tools ${similaritySearchNeo4Jgraph.name} to find the relevant document 
2. use pageNumber to query the NodeLabel "Document" in Neo4J graph with page Number 
3. check the relationships that Documents Metions
4. After find a NodeLabel that the Document mentions, use ${searchNeo4Jgraph.name} to check all the connected Nodes
Schema: ${schema}
Query: ${query}`,
                    },
                ],
                tools: [
                    zodFunction({
                        name: searchNeo4Jgraph.name,
                        description: searchNeo4Jgraph.description,
                        function: (args) => {
                            return searchNeo4JgraphFunction(args.cypherQuery)
                        },
                        parameters: searchNeo4Jgraph.schema,
                    }),
                    zodFunction({
                        name: similaritySearchNeo4Jgraph.name,
                        description: similaritySearchNeo4Jgraph.description,
                        function: (args) => {
                            return similaritySearchNeo4JgraphFunction(args.query)
                        },
                        parameters: similaritySearchNeo4Jgraph.schema,
                    }),
                ]
            })
            // .on('message', (msg) => console.log('msg', msg))
            // .on('functionCall', (functionCall) =>
            //     console.log('functionCall', functionCall)
            // )
            // .on('functionCallResult', (functionCallResult) =>
            //     console.log('functionCallResult', functionCallResult)
            // )
            // .on('content', (diff) => process.stdout.write(diff))

        const result = await runner.finalChatCompletion()
        // console.log()
        // console.log('messages')
        // console.log(runner.messages)

        // console.log()
        // console.log('final chat completion')
        console.dir(result, { depth: null })
        return NextResponse.json({ message: runner.messages })
    }
    catch (error: any) {
        console.error('Error:', error.message)
        return NextResponse.json({ output: error.message }, { status: 500 })
    }
}