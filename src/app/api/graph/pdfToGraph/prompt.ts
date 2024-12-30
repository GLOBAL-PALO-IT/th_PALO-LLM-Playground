import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
//     {
//         role: "user",
//         content: `You are a graph database expert. Your task is to generate a query to create a graph for Neo4J Cypher. Only return the query.
// Do not return query inside code blocks and text that's not a query.`,
//     },
//     {
//         role: "user",
//         content: queryPrompt(name, graph),
//     },
]);