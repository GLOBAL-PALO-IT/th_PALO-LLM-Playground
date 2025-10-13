# ReAct Agent with Internet Search

This page demonstrates the **ReAct (Reasoning and Action)** principle using Langchain and Tavily search for real-time internet information retrieval.

## Overview

The ReAct agent combines reasoning and acting in an iterative process to answer questions by searching the internet. This implementation showcases:

- **Reasoning**: The agent thinks through problems step by step
- **Action**: The agent uses tools (Tavily search) to gather information
- **Iteration**: The process repeats until the agent has enough information to answer

## Features

- 🤖 **Langchain ReAct Agent**: Implements the ReAct framework for structured reasoning
- 🔍 **Tavily Search Integration**: Uses Tavily API for high-quality internet search results
- 📊 **Transparent Process**: Shows all intermediate reasoning steps and tool calls
- 💡 **Example Queries**: Pre-populated questions to demonstrate capabilities
- ⚡ **Real-time Information**: Fetches current, up-to-date information from the web

## Technical Stack

- **Backend**: Next.js API Routes
- **LLM**: OpenAI GPT-4o via Langchain
- **Search Tool**: Tavily Search API via @langchain/community
- **Agent Framework**: Langchain ReAct Agent with AgentExecutor
- **Frontend**: React with TypeScript

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### 2. Get API Keys

- **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)
- **Tavily API Key**: Get from [tavily.com](https://tavily.com)

## How It Works

### ReAct Process Flow

1. **User Question**: User asks a question that requires current information
2. **Initial Reasoning**: Agent thinks about what information is needed
3. **Tool Selection**: Agent decides to use the Tavily search tool
4. **Action**: Agent formulates a search query and executes it
5. **Observation**: Agent receives and processes search results
6. **Iteration**: Steps 2-5 repeat if needed (up to 5 iterations)
7. **Final Answer**: Agent synthesizes information into a comprehensive answer

### Example Execution

```
Question: What are the latest developments in AI in 2024?

Thought: I need to search for recent AI developments in 2024
Action: tavily_search_results_json
Action Input: "latest AI developments 2024"
Observation: [Search results about GPT-4, Claude 3, Gemini, etc.]

Thought: I have enough information to answer the question
Final Answer: In 2024, major AI developments include...
```

## API Route

### Endpoint
`POST /api/runReActWithTavily`

### Request Body
```json
{
  "query": "Your question here"
}
```

### Response
```json
{
  "output": "Final answer text",
  "intermediateSteps": [
    {
      "action": {
        "tool": "tavily_search_results_json",
        "toolInput": "search query",
        "log": "reasoning process"
      },
      "observation": "search results"
    }
  ],
  "success": true
}
```

## UI Components

### ReActTavily Component

Located at `src/components/ReActTavily/ReActTavily.tsx`

**Features:**
- Question input textarea
- Example query buttons for quick testing
- Loading state with spinner
- Detailed display of reasoning steps
- Error handling with user-friendly messages

### Page Route

Accessible at `/reactSearch`

## Code Structure

```
src/
├── app/
│   ├── api/
│   │   └── runReActWithTavily/
│   │       └── route.ts          # API endpoint for ReAct agent
│   └── reactSearch/
│       └── page.tsx               # Page component
└── components/
    └── ReActTavily/
        └── ReActTavily.tsx        # Main UI component
```

## Example Queries

The page includes several example queries:

1. Latest developments in AI and machine learning in 2024
2. Recent Nobel Prize winners in Physics
3. Current Bitcoin price and influencing factors
4. Major climate change initiatives
5. Trending technologies in software development

## Limitations

- **Maximum Iterations**: Limited to 5 iterations to prevent infinite loops
- **Rate Limits**: Subject to OpenAI and Tavily API rate limits
- **Search Depth**: Uses "basic" search depth for faster responses
- **Result Count**: Limited to top 5 search results

## Development

### Running Locally

```bash
npm run dev
```

Navigate to `http://localhost:3000/reactSearch`

### Testing

The component includes comprehensive error handling for:
- Missing API keys
- Network errors
- OpenAI API errors
- Tavily API errors

## References

- [Langchain ReAct Agent Documentation](https://js.langchain.com/docs/modules/agents/agent_types/react)
- [Tavily Search API](https://docs.tavily.com/)
- [ReAct Paper](https://arxiv.org/abs/2210.03629)

## Contributing

When modifying this feature:
1. Test with valid API keys
2. Ensure error handling works correctly
3. Verify intermediate steps are displayed properly
4. Check that example queries are relevant and working
