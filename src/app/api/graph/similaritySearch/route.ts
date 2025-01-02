//Similarity Search Neo4j Vector
import { NextResponse } from 'next/server'
import { OpenAIEmbeddings } from "@langchain/openai";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";

export async function POST(request: Request) {

    const { indexName, nodeLabel, textNodeProperty,query } = await request.json()
    //Initialize Graph
    const url = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;
    if (!url || !username || !password) {
        throw new Error("Neo4j env vars are not defined");
    }
    try {
        // Configuration object for Neo4j connection and other related settings
        const config = {
            url: url, // URL for the Neo4j instance
            username: username, // Username for Neo4j authentication
            password: password, // Password for Neo4j authentication
            indexName: indexName,
            nodeLabel: nodeLabel,
            textNodeProperty: textNodeProperty,
            textNodeProperties: [textNodeProperty],
            embeddingNodeProperty: "embedding",
            searchType: "vector" as const,
        };

        console.log("start similarity search...")
        console.log({config})

        const neo4jVectorIndex = await Neo4jVectorStore.initialize(
            new OpenAIEmbeddings(),
            config,
        );
        const results = await neo4jVectorIndex.similaritySearch(query, 10);
        console.log({query,results})

        return NextResponse.json({ searchResults: results })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error })
    }
}