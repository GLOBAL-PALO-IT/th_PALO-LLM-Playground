import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { OpenAIEmbeddings } from "@langchain/openai";
import neo4j from 'neo4j-driver';
import { z } from "zod";

// Helper function to get Neo4j configuration
const getNeo4jConfig = () => {
    const url = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;
    
    if (!url || !username || !password) {
        throw new Error("Neo4j environment variables are not configured");
    }
    
    return { url, username, password };
}

export const searchNeo4JgraphFunction = async (cypherQuery: string) => {
    try {
        const { url, username, password } = getNeo4jConfig();
        let driver
        driver = neo4j.driver(url, neo4j.auth.basic(username, password))
        const session = driver.session()
        const result = await session.run(cypherQuery)

        driver.close()
        //Transform result to string for both NodeLabels and RelationshipTypes
        const resultString = result.records.map((record) => record.get(0)).join(', ')
        return {resultString}
    } catch (e) {
        console.error(e)
        return JSON.stringify({ error: e })
    }
}
export const searchNeo4Jgraph = {
    name: "search-using-Neo4J-graph-database",
    description: "Can search information from graph database using Cypher.",
    schema: z.object({
        cypherQuery: z.string().describe("Cypher query with no code blocks"),
    }),
}
export const similaritySearchNeo4JgraphFunction = async (query: string) => {
    try {
        const { url, username, password } = getNeo4jConfig();
        const config = {
            url: url, // URL for the Neo4j instance
            username: username, // Username for Neo4j authentication
            password: password, // Password for Neo4j authentication
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
        const searchResults = await neo4jVectorIndex.similaritySearch(query, 20);
        console.log({ config,query, searchResults })
        return {searchResults}
    } catch (e) {
        console.error(e)
        return JSON.stringify({ error: e })
    }
}

export const similaritySearchNeo4Jgraph =
{
    name: "search-using-sentence-simlarity",
    description: "Can search information from Neo4Jgraph database using sentence simlarity.",
    schema: z.object({
        query: z.string().describe("Sentence used for similarity search"),
    }),
}

