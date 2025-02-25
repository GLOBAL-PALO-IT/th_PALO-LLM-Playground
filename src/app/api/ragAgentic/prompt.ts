import { SearchResult } from "../qdrant/searchEmbeddings/route"

const searchResultToContextString = (context: SearchResult) => {
    const contextString = context.points.map((point) => {
        const xmlTag = `index-${point.id}`
        return `<${xmlTag}>${point.payload?.pageContent}</${xmlTag}>`
    }).join('\n')

    return contextString
}

export const ragChatPromptBuilder = (context: SearchResult, question: string) => {
    
    const contextString = searchResultToContextString(context)

    const prompt = `<context>${contextString}</context>
You are a helpful assistant bot that helps users answer the question based on the context given in the <context> xml tags above.
Think step by step in English first and answer the question in Thai

Question:${question}`

    return prompt
}

export const rawRagChatPromptBuilder = (rawContext: string, question: string) => {
    

    const prompt = `<context>${rawContext}</context>
You are a helpful assistant bot that helps users answer the question based on the context given in the <context> xml tags above.

Question:${question}
Let's think step by step in English first and answer the question in Thai`

    return prompt
}

export const chooseTheBestContextPrompt = (context: SearchResult, question: string): string => {
    const contextString = searchResultToContextString(context)
    const prompt = `You are an AI assistant. You must choose the best context to that relevant to the question.

Context: ${contextString}
Question: ${question}
Let's think step by step to choose the best context.`
    return prompt
}

export const rewriteTextToKnowledgePrompt = (text: string, question: string): string => {
    const prompt = `You are an AI assistant. Given the question, you must rewrite the given text into list of bullet points of knowledge that
relevant to the question.

Question: ${question}
Text: ${text}
List of knowledge:`
    return prompt
}

export const rephraseQuestionPrompt = (question: string) => {
    const prompt = `You are an AI assistant. You must rephrase the given question into a clear and elaborate question.

Question: ${question}
Rephrased Question in English:`
    return prompt
}
export const rewriteQueryPrompt = (question: string) => {
    const prompt = `You are an AI assistant. You must write hypotentical document based on the given question.
The hypotentical document you come up with is what likely to be used to answer the given question.

Question: ${question}
Hypotentical Document:`
    return prompt
}
export const evaluateAnswerPrompt = (answer: string, question: string) => {
    const prompt = `You are an AI assistant. You must evaluate the given answer to the question.

Answer: ${answer}
Question: ${question}
Evaluation:`
    return prompt
}