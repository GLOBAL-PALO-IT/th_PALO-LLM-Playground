import { tool } from "@langchain/core/tools";
import { z } from "zod";
import neo4j, { Node, Relationship } from 'neo4j-driver'
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
//Initialize Graph
const url = process.env.NEO4J_URI;
const username = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;
if (!url || !username || !password) {
    throw new Error("Neo4j env vars are not defined");
}
// Configuration object for Neo4j connection and other related settings
let config = {
    url: url, // URL for the Neo4j instance
    username: username, // Username for Neo4j authentication
    password: password, // Password for Neo4j authentication
};
export const searchNeo4JgraphFunction = async (cypherQuery: string) => {
    try {
        let driver
        driver = neo4j.driver(url, neo4j.auth.basic(username, password))
        const session = driver.session()
        const result = await session.run(cypherQuery)

        // console.log('Result Records: ', result.records)
        driver.close()
        //Transform result to string for both NodeLabels and RelationshipTypes
        const resultString = result.records.map((record) => record.get(0)).join(', ')
        // console.log({ url, username, password, cypherQuery, resultString })
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
        const rawText = searchResults.map((result, index) => {
            return `<${index + 1}><text>${result.pageContent}</text><pageNumber>${result.metadata.pageNumber}</pageNumber></${index + 1}>`
        }).join('')
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

