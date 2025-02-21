export const ragChatprompt = `You are a helpful assistant bot that helps users answer the question based on the context given in the <context> xml tags.
Rephrase the question then think step by step in English first and answer the question in Thai
Question:`

export const ragChatPromptBuilder = (context: string[], question: string) => {
    const contextString = context
        .map((chunk, index) => {
            return `<${index}>${chunk}</${index}>`
        })
        .join('')

    return `<context>${contextString}</context>

${ragChatprompt} ${question}`
}

export const chooseTheBestContextPrompt = (context: string[], question: string): string => {
    const contextString = context
        .map((chunk, index) => {
            return `<${index}>${chunk}</${index}>`
        })
        .join('')
    const prompt = `You are an AI assistant. You must choose the best context to that relevant to the question.
Only output the number or a list of number separate with ",". Do not output any text except the number.

Example output: 
- "1,2"
- "1,2,3"
- 3

Context: ${contextString}
Question: ${question}
Relevant Conext Number indicate in < > xml tag:`
    return prompt
}

export const rewriteTextToKnowledgePrompt = (text:string): string => {
    const prompt = `You are an AI assistant. You must rewrite the given text into a well formatted text.
Do not add new information. Only output the new reformatted text.

Text: ${text}`
    return prompt
}

export const rephraseQuestionPrompt = (question: string) => {
    const prompt = `You are an AI assistant. You must rephrase the given question into a clear and elaborate question.

Question: ${question}
Rephrased Question:`
    return prompt
}