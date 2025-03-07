export const ragChatPromptBuilder = (context: string[], question: string) => {
    const prompt = `You are a helpful assistant bot that helps users answer the question 
based on the context given in the <context> xml tags.
If you do not know the answer to the question, just say that you don't know, don't try to make up an answer.

Question:`
    const contextString = context
        .map((chunk, index) => {
            return `<${index}>${chunk}</${index}>`
        })
        .join('')

    return `<context>${contextString}</context>${prompt} ${question}`
}