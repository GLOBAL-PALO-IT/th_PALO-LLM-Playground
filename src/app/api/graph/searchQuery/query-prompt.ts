export const queryPrompt = (graphDBName: string, description: string, question: string)=>{
    return `Generate search query to find information in ${graphDBName} with the following graph description: ${description}
to answer the following question:

Question: ${question}

Only return the query. Do not return query inside code blocks and text that's not a query.`
}