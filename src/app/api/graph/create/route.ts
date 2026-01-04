//Transform Graph description to Graph Query
import { NextResponse } from 'next/server'
import { queryPrompt } from './query-prompt'
import { ModelName } from '@/lib/utils'
import { openaiInstance } from '@/lib/openai'

export async function POST(request: Request) {
    
    const { name, graph } = await request.json()
    try {
        const response = await openaiInstance().chat.completions.create({
            model: ModelName.GPT4O,
            messages: [
                {
                    role: 'system',
                    content: `You are a graph database expert. Your task is to generate a query to create a graph for ${name}. Only return the query.
Do not return query inside code blocks and text that's not a query.`,
                },
                {
                    role: 'user',
                    content: queryPrompt(name, graph),
                },
            ],
        });
        const { choices } = response
        const query = choices[0].message.content
        console.log({ query, name, graph })
        return NextResponse.json({ query })
    } catch (error) {
        return NextResponse.json({ error })
    }
}