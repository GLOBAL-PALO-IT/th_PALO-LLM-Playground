import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { ModelName } from "@/lib/utils";
import { checkIfContextRelevantLightPrompt, checkIfContextRelevantPrompt as checkIfContextRelevantCOTPrompt, chooseTheBestContextPrompt, evaluateAnswerPrompt, improveQuestionPrompt as improveQueryPrompt, qaPlannerPrompt, rephraseQuestionPrompt, rewriteQueryPrompt, rewriteTextToKnowledgePrompt } from "./prompt";
import { SearchResult, SearchResultPoint } from "@/types/qdrant";
const openai = new OpenAI()
const SelectedIndex = z.object({
    selectedIndex: z.array(z.number()),
});

const FinalRelevantClassification = z.object({
    classification: z.enum(["RELEVANT", "SUPPORT", "NOT RELEVANT"]),
})

// type of FinalRelevantClassification
type FinalRelevantClassificationType = z.infer<typeof FinalRelevantClassification>

export const extractDocumentIndexID = async (document: string) => {
    try {
        const completion = await openai.beta.chat.completions.parse({
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
        console.log('extractDocumentIndexID: ' + JSON.stringify(completion.choices[0].message.parsed))
        return completion.choices[0].message.parsed;
    } catch (error) {
        console.log('error extractDocumentIndexID: ' + error)
    }

}
export const qaPlanner = async (question: string) => {
    const completion = await openai.chat.completions.create({
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
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    console.log('planner: ' + output)
    return output
}

export const rewriteTextToKnowledge = async (text: string, question: string) => {
    // rewriteTextToKnowledgePrompt
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: rewriteTextToKnowledgePrompt(text, question),
            },
        ],
        model: ModelName.GPT4O_MINI,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "rewriteTextToKnowledge"
        }
    })
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    console.log('rewrite: ' + output)
    return output
}
export const rewriteAll = async (points: SearchResultPoint[], question: string, chunkSize: number = 10) => {
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

export const chooseTheBestContext = async (context: SearchResult, question: string) => {
    const completion = await openai.chat.completions.create({
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
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    console.log('\x1b[32m%s\x1b[0m', 'chooseTheBestContext: ' + output)
    return output
}

export const checkIfContextRelevantAll = async (searchResult: SearchResult, question: string, light: boolean = true): Promise<SearchResultPoint[]> => {
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

export const checkIfContextRelevant = async (context: string, question: string, light: boolean = true):
    Promise<{ output: FinalRelevantClassificationType | null, metadata: { analysisText: string } } | null | undefined> => {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: light ?
                    checkIfContextRelevantLightPrompt(context, question) :
                    checkIfContextRelevantCOTPrompt(context, question),
            },
        ],
        model: ModelName.GPT4O_MINI,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "checkIfContextRelevant"
        }
    })
    const analysisText = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    console.log('\x1b[32m%s\x1b[0m', 'checkIfContextRelevant analysisText: ' + analysisText)
    try {
        const completion = await openai.beta.chat.completions.parse({
            model: ModelName.GPT4O_MINI,
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
        console.log('extractRel checkIfContextRelevant: ' + JSON.stringify(completion.choices[0].message.parsed?.classification))
        return { output: completion.choices[0].message.parsed, metadata: { analysisText } };
    } catch (error) {
        console.log('error extractRel checkIfContextRelevant: ' + error)
        return undefined
    }
}
export const rewriteQuery = async (question: string) => {
    const completion = await openai.chat.completions.create({
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
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    return output
}
// rephraseQuestionPrompt
export const rephraseQuestion = async (question: string) => {
    const completion = await openai.chat.completions.create({
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
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    return output
}

export const improveQuery = async (question: string) => {
    const completion = await openai.chat.completions.create({
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
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    return output
}

export const answerQuestion = async (prompt: string): Promise<string> => {
    const completion = await openai.chat.completions.create({
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
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    console.log('answer: ' + output)
    return output
}

export const extractFinalAnswer = async (text: string) => {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: `You are an AI assistant. Your task is to translate the given text into Thai language.
Text: ${text}
Thai:`,
            },
        ],
        model: ModelName.GPT4O_MINI,
        temperature: 0.2,
        top_p: 0.2,
        store: true,
        metadata: {
            name: 'ragAgentic',
            function: "extractFinalAnswer"
        }
    })
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    return output
}

export const evaluateAnswer = async (answer: string, question: string) => {
    const completion = await openai.chat.completions.create({
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
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    return output
}