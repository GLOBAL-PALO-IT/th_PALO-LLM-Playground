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


Question:${question}

Let's think step by step in English first and answer the question in Thai
IMPORTANT:
Try to answer this question/instruction with step-by-step thoughts and make the answer more structural.
Use "\n\n" to split the answer into several paragraphs.`

    return prompt
}

export const rawRagChatPromptBuilder = (rawContext: string, question: string) => {
    

    const prompt = `<context>${rawContext}</context>
You are a helpful assistant bot that helps users answer the question based on the context given in the <context> xml tags above.

Question:${question}

Let's think step by step in English first and answer the question in Thai
IMPORTANT:
Try to answer this question/instruction with step-by-step thoughts and make the answer more structural.
Use "\n\n" to split the answer into several paragraphs.
`

    return prompt
}

export const chooseTheBestContextPrompt = (context: SearchResult, question: string): string => {
    const contextString = searchResultToContextString(context)
    const prompt = `You are an AI assistant. You must choose the best context to that relevant to the question.

Context: ${contextString}
Question: ${question}

Let's think step by step to choose the best context.
IMPORTANT:
Try to answer this question/instruction with step-by-step thoughts and make the answer more structural.
Use "\n\n" to split the answer into several paragraphs.
`
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
export const improveQuestionPrompt = (question: string) => {
    const prompt = `You are an AI assistant. 
You must improve the given web query because the current query is not effective enough to answer the question.

Web Query: ${question}
Improve Web Query:`
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
Your task is to provide a 'total rating' scoring how well the answers the user concerns expressed in the question.
Give your answer on a scale of 1 to 4, where 1 means that the answer is not helpful at all, and 4 means that the answer completely and helpfully addresses the question.

Here is the scale you should use to build your answer:
1: The answer is terrible: completely irrelevant to the question asked, or very partial
2: The answer is mostly not helpful: misses some key aspects of the question
3: The answer is mostly helpful: provides support, but still could be improved
4: The answer is excellent: relevant, direct, detailed, and addresses all the concerns raised in the question

Provide your feedback as follows:

# Feedback
- Evaluation: (your rationale for the rating, as a text)
- Total rating: (your rating, as a number between 1 and 4)

You MUST provide values for 'Evaluation:' and 'Total rating:' in your answer.

Now here are the question and answer.

Answer: ${answer}
Question: ${question}

Provide your feedback. 
# Feedback
- Evaluation:`
    return prompt
}