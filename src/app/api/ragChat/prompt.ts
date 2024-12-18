export const ragChatprompt = `You are a helpful assistant bot that helps users answer the question based on the context given in the <context> xml tags.
Question:`

export const ragChatPromptBuilder = (context: string[], question: string) => {
    const contextString = context
        .map((chunk, index) => {
            return `<${index}>${chunk}</${index}>`
        })
        .join('')

    return `<context>${contextString}</context>${ragChatprompt} ${question}`
}