//Transform Question to Query
import { NextResponse } from 'next/server'
import { OpenAIEmbeddings } from "@langchain/openai";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";

export async function POST(request: Request) {

    const { indexName, nodeLabel, textNodeProperties } = await request.json()
    //Initialize Graph
    const url = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;
    if (!url || !username || !password) {
        return NextResponse.json({ error: "Neo4j environment variables are not configured. Please set NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD." }, { status: 500 });
    }
    try {
        const config = {
            url: url, // URL for the Neo4j instance
            username: username, // Username for Neo4j authentication
            password: password, // Password for Neo4j authentication
            indexName: indexName,
            nodeLabel: nodeLabel,
            textNodeProperties: textNodeProperties,
            embeddingNodeProperty: "embedding",
            searchType: "hybrid" as const,
        };
        console.log("start vectorizing...")

        // You should have a populated Neo4j database to use this method
        const neo4jVectorIndex = await Neo4jVectorStore.fromExistingGraph(
            new OpenAIEmbeddings(),
            config
        );

        await neo4jVectorIndex.close();
        console.log('done vectorizing...')
        return NextResponse.json({ status: 'done' })
    } catch (error) {
        return NextResponse.json({ error })
    }
}