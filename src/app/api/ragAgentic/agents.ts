import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { ModelName } from "@/lib/utils";
import { 
  checkIfContextRelevantLightPrompt, 
  checkIfContextRelevantPrompt as checkIfContextRelevantCOTPrompt, 
  chooseTheBestContextPrompt, 
  evaluateAnswerPrompt, 
  improveQuestionPrompt as improveQueryPrompt, 
  qaPlannerPrompt, 
  rephraseQuestionPrompt, 
  rewriteQueryPrompt, 
  rewriteTextToKnowledgePrompt 
} from "./prompt";
import { SearchResult, SearchResultPoint } from "@/types/qdrant";
import { openaiInstance } from "@/lib/openai";

// Zod schemas for structured outputs
const SelectedIndex = z.object({
    selectedIndex: z.array(z.number()),
});

const FinalRelevantClassification = z.object({
    classification: z.enum(["RELEVANT", "SUPPORT", "NOT RELEVANT"]),
})

type FinalRelevantClassificationType = z.infer<typeof FinalRelevantClassification>

/**
 * Extracts document index IDs from a document using OpenAI
 * @param document - The document text to analyze
 * @returns Selected index numbers or undefined on error
 */
export const extractDocumentIndexID = async (document: string) => {
    try {
        const completion = await openaiInstance().beta.chat.completions.parse({
            model: ModelName.GPT4O,
            messages: [
                { role: "system", content: "Extract the relevant context index from the document. If not relevant context found return empty" },
                { role: "user", content: `Document: ${document}\n The relevant context index number are(exclude prefix "index-"): ` },
            ],
            response_format: zodResponseFormat(SelectedIndex, "relevant-context-index"),
            store: true,
            metadata: {
                name: 'ragAgentic',
                function: "extractDocumentIndexID"
            }
        });
        console.log('extractDocumentIndexID:', JSON.stringify(completion.choices[0].message.parsed))
        return completion.choices[0].message.parsed;
    } catch (error) {
        console.error('Error in extractDocumentIndexID:', error)
        return undefined
    }
}
/**
 * Creates a question-answering plan using OpenAI
 * @param question - The question to create a plan for
 * @returns The generated plan as a string
 */
export const qaPlanner = async (question: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: qaPlannerPrompt(question),
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "qaPlanner"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    console.log('QA Planner output:', output)
    return output
}

/**
 * Rewrites text to knowledge format for better context understanding
 * @param text - The text to rewrite
 * @param question - The question context
 * @returns Rewritten text as knowledge
 */
export const rewriteTextToKnowledge = async (text: string, question: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: rewriteTextToKnowledgePrompt(text, question),
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "rewriteTextToKnowledge"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    console.log('Rewrite to knowledge:', output)
    return output
}

/**
 * Rewrites all search result points to knowledge format in batches
 * @param points - Array of search result points
 * @param question - The question context
 * @param chunkSize - Size of each batch (default: 10)
 * @returns Array of rewritten search result points
 */
export const rewriteAll = async (
    points: SearchResultPoint[], 
    question: string, 
    chunkSize: number = 10
): Promise<SearchResultPoint[]> => {
    const chunks: SearchResultPoint[][] = [];
    
    // Split points array into chunks
    for (let i = 0; i < points.length; i += chunkSize) {
        chunks.push(points.slice(i, i + chunkSize));
    }
    
    // Process each chunk sequentially
    const results: SearchResultPoint[] = [];
    for (const chunk of chunks) {
        const chunkResults = await Promise.all(chunk.map(async (point) => {
            const newPayload = await rewriteTextToKnowledge(point.payload?.pageContent as string, question);
            return {
                ...point,
                payload: {
                    ...point.payload,
                    pageContent: newPayload
                }
            };
        }));
        results.push(...chunkResults);
    }
    
    return results;
}

/**
 * Chooses the best context from search results for a given question
 * @param context - Search results to choose from
 * @param question - The question to match context against
 * @returns The best matching context as a string
 */
export const chooseTheBestContext = async (context: SearchResult, question: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: chooseTheBestContextPrompt(context, question),
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "chooseTheBestContext"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    console.log('\x1b[32m%s\x1b[0m', 'Best context chosen:', output)
    return output
}

/**
 * Checks relevance of all contexts in search results
 * @param searchResult - Search results to check
 * @param question - The question to check relevance against
 * @param light - Whether to use light or full checking (default: true)
 * @returns Array of search result points with relevance classification
 */
export const checkIfContextRelevantAll = async (
    searchResult: SearchResult, 
    question: string, 
    light: boolean = true
): Promise<SearchResultPoint[]> => {
    console.log('checkIfContextRelevantAll length: ', { length: searchResult.points.length })
    const newPoints = await Promise.all(searchResult.points.map(async (point) => {
        const result = await checkIfContextRelevant(point.payload?.pageContent as string, question, light)
        const { output, metadata } = result ?? { output: null, metadata: null }
        return {
            ...point,
            payload: {
                ...point.payload,
                relevantClassification: output?.classification,
                metadata
            }
        }
    }))
    return newPoints
}

/**
 * Checks if a single context is relevant to the question
 * @param context - The context text to check
 * @param question - The question to check relevance against
 * @param light - Whether to use light or full checking (default: true)
 * @returns Classification result with metadata or undefined on error
 */
export const checkIfContextRelevant = async (
    context: string, 
    question: string, 
    light: boolean = true
): Promise<{ output: FinalRelevantClassificationType | null, metadata: { analysisText: string } } | undefined> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: light ?
                    checkIfContextRelevantLightPrompt(context, question) :
                    checkIfContextRelevantCOTPrompt(context, question),
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "checkIfContextRelevant"
        }
    })
    const analysisText = completion.choices[0].message.content ?? ''
    
    try {
        const completion = await openaiInstance().beta.chat.completions.parse({
            model: ModelName.GPT4O,
            messages: [
                { role: "system", content: "Extract the final answer of given analyze text either RELEVANT, SUPPORT, NOT RELEVANT" },
                { role: "user", content: `Analysis: ${analysisText}\n Final Classification:` },
            ],
            response_format: zodResponseFormat(FinalRelevantClassification, "relevant-classification"),
            store: true,
            metadata: {
                name: 'ragAgentic',
                function: "checkIfContextRelevant Structure"
            }
        });
        return { output: completion.choices[0].message.parsed, metadata: { analysisText } };
    } catch (error) {
        console.error('Error in context relevance classification:', error)
        return undefined
    }
}

/**
 * Rewrites a query for better search results
 * @param question - The original question
 * @returns Rewritten query
 */
export const rewriteQuery = async (question: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: rewriteQueryPrompt(question),
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "rewriteQuery"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    return output
}

/**
 * Rephrases a question for better understanding
 * @param question - The original question
 * @returns Rephrased question
 */
export const rephraseQuestion = async (question: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: rephraseQuestionPrompt(question),
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "rephraseQuestion"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    return output
}

/**
 * Improves a query for better results
 * @param question - The original question
 * @returns Improved query
 */
export const improveQuery = async (question: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: improveQueryPrompt(question),
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "improveQuery"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    return output
}

/**
 * Answers a question using the provided prompt
 * @param prompt - The prompt containing context and question
 * @returns The answer to the question
 */
export const answerQuestion = async (prompt: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "answerQuestion"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    console.log('Answer:', output)
    return output
}

/**
 * Extracts and translates the final answer to Thai
 * @param text - The text to translate
 * @returns Thai translation
 */
export const extractFinalAnswer = async (text: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: `You are an AI assistant. Your task is to translate the given text into Thai language.
Text: ${text}
Thai:`,
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "extractFinalAnswer"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    return output
}

/**
 * Evaluates the quality of an answer for a given question
 * @param answer - The answer to evaluate
 * @param question - The original question
 * @returns Evaluation result
 */
export const evaluateAnswer = async (answer: string, question: string): Promise<string> => {
    const completion = await openaiInstance().chat.completions.create({
        messages: [
            {
                role: 'user',
                content: evaluateAnswerPrompt(answer, question),
            },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "evaluateAnswer"
        }
    })
    const output = completion.choices[0].message.content ?? ''
    return output
}