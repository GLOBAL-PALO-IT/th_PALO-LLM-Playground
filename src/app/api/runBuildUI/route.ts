import { openaiInstance } from '@/lib/openai'
import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'

const constructPrompt = (query: string) => {
  return `Instruction: ${query}
    Instruction: ${query}

    From given instruction, please write code to build UI using the following tech stack:
    - NextJs
    - Typescript
    - TailwindCSS
    
    We already have everything setup for you. You just need to write the code to build the page.
    
    Important styling requirements:
    - Style the UI to resemble Airbnb's design aesthetic with rounded corners
    - Use Airbnb's signature color palette with #FF385C as the primary color
    - Implement clean, minimalist layouts with appropriate spacing
    - Use shadow effects sparingly for depth when needed
    
    Code requirements:
    - Write functional React components WITHOUT using React.FC type annotation
    - Use arrow function syntax for components
    - Follow TypeScript best practices with proper type definitions
    - Use only standard Tailwind CSS classes (no custom CSS)
    - Do NOT include any import statements or require statements
    - Do NOT include any export statements
    
    Format your response as follows:
    1. Brief explanation of your implementation
    2. Add the line "// Code starts here"
    3. Provide the complete functional component code
    4. End with "// Code ends here"
    
    The component should follow this structure:
    const ComponentName = () => {
      // State declarations with useState
      // Any other hooks or functions
      // Event handlers
      return (
      // JSX with Tailwind classes for Airbnb-like styling
      );
    };
  `
}

export async function POST(request: Request) {
  const { query }: { query: string } = await request.json()

  //   const messages: ChatCompletionMessageParam = {
  //     role: 'user',
  //     content: query,
  //   }

  const prompt = constructPrompt(query)
  console.log({ prompt })

  try {
    const completion = await openaiInstance().chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      // model: "gpt-4o",
      model: ModelName.GPT4O,
      temperature: 0.2,
      max_tokens: 8192,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    console.log(completion.choices[0])
    const message = completion.choices[0].message
    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
