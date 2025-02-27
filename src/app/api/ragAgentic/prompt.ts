import { SearchResult } from "../qdrant/searchEmbeddings/route"
export const qaPlannerPrompt = (question: string) => {
    const prompt = `You are a strategic AI research assistant specializing in breaking down complex problems into actionable steps. For the given question, generate a detailed step-by-step plan that would help someone systematically solve the problem.

For each step:
1. Provide a clear, specific description of what needs to be done
2. Include the exact search query that would yield the most relevant information
3. Explain briefly why this step and search query are necessary

Your plan should be comprehensive enough to solve the problem completely, but avoid unnecessary steps. Include contingency steps for potential roadblocks where appropriate.

Format your response in markdown as follows:

# Question: a question you must plan to answer

# Step-by-Step Solution Plan

## Step 1: [Concise action title]
**Task:** [Detailed description of what needs to be done]
**Search Query:** "[Specific, optimized search query]"
**Rationale:** [Brief explanation of why this step is necessary]

## Step 2: [Concise action title]
**Task:** [Detailed description of what needs to be done]
**Search Query:** "[Specific, optimized search query]"
**Rationale:** [Brief explanation of why this step is necessary]

[Continue with additional steps as needed]

## Final Step: [Verification/implementation title]
**Task:** [How to verify the solution works or implement final actions]
**Search Query:** "[Final verification query if needed]"
**Rationale:** [Why this verification/implementation matters]

# Question: ${question}

# Step-by-Step Solution Plan
`
    return prompt
}
const searchResultToContextString = (context: SearchResult) => {
    const contextString = context.points.map((point) => {
        const xmlTag = `index-${point.id}`
        return `<${xmlTag}>${point.payload?.pageContent}</${xmlTag}>`
    }).join('\n')

    return contextString
}

export const ragChatPromptBuilder = (context: SearchResult, question: string) => {
    
    const contextString = searchResultToContextString(context)

    const prompt = `<context>
${contextString}
</context>

You are a helpful assistant that answers the user's question strictly based on the information provided within the \`<context>\` XML tags above.
Question:${question}

If you don't know the answer just say you don't know.
Let's think step by step in English first and answer the question in Thai.
`

    return prompt
}

export const rawRagChatPromptBuilder = (rawContext: string, question: string) => {
    

    const prompt = `<context>${rawContext}</context>
You are a helpful assistant bot that helps users answer the question based on the context given in the <context> xml tags above.

Question:${question}

Let's think step by step in English first and answer the question in Thai
`

    return prompt
}
export const checkIfContextRelevantLightPrompt = (context: string, question: string): string => {
    return `You are an AI assistant tasked with evaluating the relevance of a given context to a question. 

### Instructions:
1. Analyze the provided context and the question.
2. Determine the relationship between them based on the following categories:
   - **RELEVANT**: The context directly answers or provides crucial information for the question.
   - **SUPPORT**: The context contains useful background information but does not fully answer the question.
   - **NOT RELEVANT**: The context does not help in answering the question.

### Data:
- **Context:** ${context}
- **Question:** ${question}

Carefully analyze and output only one of the three labels: 'RELEVANT', 'SUPPORT', or 'NOT RELEVANT'.`;
};


export const checkIfContextRelevantPrompt = (context: string, question: string): string => {
    return `You are an AI assistant tasked with evaluating the relevance of a given context to a question. 

### Instructions:
1. Carefully analyze the context and the question.
2. Think step by step, considering:
   - What information the question seeks.
   - What information the context provides.
   - Whether the context fully answers, partially supports, or is unrelated to the question.
3. Clearly explain your reasoning step by step before giving the final classification.

### Data:
- **Context:** ${context}
- **Question:** ${question}

### Output Format:
First, provide a structured step-by-step reasoning process explaining your analysis.  
Then, on a new line, output one of the following final labels in uppercase:  
- **RELEVANT**: The context directly answers or provides crucial information for the question.  
- **SUPPORT**: The context contains useful background information but does not fully answer the question.  
- **NOT RELEVANT**: The context does not help in answering the question.`;
};

export const chooseTheBestContextPrompt = (context: SearchResult, question: string): string => {
    const contextString = searchResultToContextString(context)
    const prompt = `You are an AI assistant. You must choose the context that relevant to the question.

Context: ${contextString}
Question: ${question}

Analyze each context step by step and find the relevant context at the end output a list of index of the relevant context
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

export const rephraseQuestionPrompt = (question: string): string => {
    const prompt = `You are an AI assistant tasked with rephrasing questions to improve clarity while preserving the original meaning and language. Ensure the rephrased question is concise, easy to understand, and maintains the intent of the original question.

Original Question: ${question}

Rephrased Question:`;
    return prompt;
}
export const improveQuestionPrompt = (question: string) => {
    const prompt = `You are an AI assistant. 
You must improve the given current web query because the current web query is not effective enough to answer the question.
The improve web query must be keywords from the current web query.
Only output the keywords, no prefix or suffix or explanation.

Current Web Query: ${question}
Improve Web Query:`
    return prompt
}
export const rewriteQueryPrompt = (question: string) => {
    const prompt = `You are an AI assistant. Your task is to generate a hypothetical document that would likely be used to answer the given question. 
Ensure the document is relevant, detailed, and written in the same language as the question.

Question: ${question}
Hypothetical Document:`;
    return prompt;
};

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