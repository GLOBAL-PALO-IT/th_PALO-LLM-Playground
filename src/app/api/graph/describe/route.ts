// Transform Text to Graph
import { NextResponse } from 'next/server'
import { constructionPrompt } from './contruction-prompt'
import { ModelName } from '@/lib/utils'
import { openaiInstance } from '@/lib/openai'

export async function POST(request: Request) {
    
    const { text,targetNodes, targetRelationships } = await request.json()
    try {
        const response = await openaiInstance().chat.completions.create({
            model: ModelName.GPT4O,
            messages: [
                {
                    role: 'system',
                    content: constructionPrompt
                },
                {
                    role: 'user',
                    content: `${targetNodes && targetNodes.length > 0 ? "Target Nodes: " + targetNodes : ""}
${targetRelationships && targetRelationships.length > 0 ? "Target Relationships: " + targetRelationships : ""}
Construct knowledge graph from the following text:

Text: ${text}`,
                },
            ],
        })
        const graph = response.choices[0].message.content
        console.log({graph, text})
        return NextResponse.json({ graph })
    } catch (error: any) {
        return NextResponse.json({ output: error.message }, { status: 500 })
    }
}