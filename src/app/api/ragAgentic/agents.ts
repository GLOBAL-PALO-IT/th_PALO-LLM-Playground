import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { observeOpenAI } from "langfuse";
import { ModelName } from "@/lib/utils";
import { chooseTheBestContextPrompt, evaluateAnswerPrompt, improveQuestionPrompt as improveQueryPrompt, rephraseQuestionPrompt, rewriteQueryPrompt, rewriteTextToKnowledgePrompt } from "./prompt";
import { SearchResult } from "../qdrant/searchEmbeddings/route";
const openai = observeOpenAI(new OpenAI());
const SelectedIndex = z.object({
    selectedIndex: z.array(z.number()),
});

export const extractDocumentIndexID = async (document: string) => {
    try{
        const completion = await openai.beta.chat.completions.parse({
            model: ModelName.GPT4O,
            messages: [
                { role: "system", content: "Extract the best context index from the document. If not relevant context found return empty" },
                { role: "user", content: `Document: ${document}\n The relevant context index number are(exclude prefix "index-"): ` },
            ],
            response_format: zodResponseFormat(SelectedIndex, "final-selected-index"),
        });
        console.log('extractDocumentIndexID: '+JSON.stringify(completion.choices[0].message.parsed))
        return completion.choices[0].message.parsed;
    }catch(error){
        console.log('error extractDocumentIndexID: '+error)
    }
    
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
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
    })
    const output = completion.choices[0].message.content? completion.choices[0].message.content : ''
    console.log('rewrite: '+output)
    return output
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
    // console.log('chooseTheBestContext: '+output)
    return output
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
    console.log('answer: '+output)
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