export const queryPrompt = (graphDBName: string, description: string)=>{
    return `Generate a query to create graph of ${graphDBName} with the following graph description: ${description}
    Only return the query. Do not return query inside code blocks and text that's not a query.
    Always provide node's property 'name' in the query.`
}