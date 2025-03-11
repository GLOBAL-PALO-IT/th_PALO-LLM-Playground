//Transform Question to Query
import { NextResponse } from 'next/server'
import { queryPrompt } from './query-prompt'
import { ModelName } from '@/lib/utils'
import { openaiInstance } from '@/lib/openai'

export async function POST(request: Request) {
    
    const { name, description, question } = await request.json()
    try {
        const response = await openaiInstance().chat.completions.create({
            model: ModelName.GPT4O,
            messages: [
                {
                    role: 'system',
                    content: `You are a graph database expert. Your task is to generate a query to search in ${name} to answer this question

Question: ${question}

Only return the query.
Do not return query inside code blocks and text that's not a query.`,
                },
                {
                    role: 'user',
                    content: queryPrompt(name,description,question),
                },
            ],
        });
        const { choices } = response
        const query = choices[0].message.content
        console.log({ query, name, description })
        return NextResponse.json({ query })
    } catch (error) {
        return NextResponse.json({ error })
    }
}