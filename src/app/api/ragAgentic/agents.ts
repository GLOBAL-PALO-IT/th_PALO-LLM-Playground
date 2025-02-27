import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { ModelName } from "@/lib/utils";
import { checkIfContextRelevantLightPrompt, checkIfContextRelevantPrompt, chooseTheBestContextPrompt, evaluateAnswerPrompt, improveQuestionPrompt as improveQueryPrompt, qaPlannerPrompt, rephraseQuestionPrompt, rewriteQueryPrompt, rewriteTextToKnowledgePrompt } from "./prompt";
import { SearchResult, SearchResultPoint } from "../qdrant/searchEmbeddings/route";
import { metadata } from "@/app/layout";
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
    })
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    console.log('rewrite: ' + output)
    return output
}
export const rewriteAll = async (points: SearchResultPoint[], question: string) => {
    const newPoints = await Promise.all(points.map(async (point) => {
        const newPayload = await rewriteTextToKnowledge(point.payload?.pageContent as string, question)
        return {
            ...point,
            payload: {
                ...point.payload,
                pageContent: newPayload
            }
        }
    }))
    return newPoints
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
    })
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    console.log('\x1b[32m%s\x1b[0m', 'chooseTheBestContext: ' + output)
    return output
}

export const checkIfContextRelevantAll = async (searchResult: SearchResult, question: string, light: boolean = true): Promise<SearchResultPoint[]> => {
    console.log('checkIfContextRelevantAll length: ',{length: searchResult.points.length})
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
                checkIfContextRelevantPrompt(context, question),
            },
        ],
        model: ModelName.GPT4O_MINI,
        temperature: 0.2,
        top_p: 0.2,
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
    })
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    console.log('answer: ' + output)
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
    })
    const output = completion.choices[0].message.content ? completion.choices[0].message.content : ''
    return output
}