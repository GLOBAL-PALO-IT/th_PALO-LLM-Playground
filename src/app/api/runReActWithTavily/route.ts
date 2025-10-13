import { NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { AgentExecutor, createReactAgent } from 'langchain/agents'
import { PromptTemplate } from '@langchain/core/prompts'

export async function POST(request: Request) {
  const { query }: { query: string } = await request.json()

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Query is required' },
      { status: 400 }
    )
  }

  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json(
      { error: 'TAVILY_API_KEY is not configured' },
      { status: 500 }
    )
  }

  try {
    // Initialize the Tavily search tool
    const searchTool = new TavilySearchResults({
      maxResults: 5,
      apiKey: process.env.TAVILY_API_KEY,
      includeAnswer: true,
      searchDepth: 'basic',
    })

    // Initialize the LLM
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
    })

    // Create the tools array
    const tools = [searchTool]

    // Create a ReAct prompt template following the standard ReAct format
    const prompt = PromptTemplate.fromTemplate(
      `Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}`
    )

    // Create the ReAct agent
    const agent = await createReactAgent({
      llm,
      tools,
      prompt,
    })

    // Create an agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
      maxIterations: 5,
      returnIntermediateSteps: true,
    })

    // Execute the agent
    const result = await agentExecutor.invoke({
      input: query,
    })

    return NextResponse.json({
      output: result.output,
      intermediateSteps: result.intermediateSteps || [],
      success: true,
    })
  } catch (error: any) {
    console.error('Error in ReAct with Tavily:', error)
    return NextResponse.json(
      { 
        error: error.message || 'An error occurred',
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}
