import { openaiInstance } from '@/lib/openai'
import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'

const constructPrompt = (query: string) => {
  return `Instruction: ${query}

    From given instruction, please write code to build UI using the following tech stack:
    - NextJs
    - Typescript
    - TailwindCSS

    We already have everything setup for you. You just need to write the code to build the page.

    Important styling requirements:
    - Style the UI to resemble Airbnb's design aesthetic with rounded corners and clean layouts
    - Use ONLY standard Tailwind CSS utility classes (no custom classes)
    - For Airbnb's color scheme, use Tailwind's red-500 for the primary color, similar to Airbnb's #FF385C
    - Avoid any Tailwind classes with arbitrary values (like w-[300px] or text-[22px]) as these won't work
    - Stick to standard Tailwind utility classes (like p-4, text-xl, rounded-lg, etc.)

    Code requirements:
    - Write functional React components WITHOUT using React.FC type annotation
    - Use arrow function syntax for components
    - Follow TypeScript best practices with simple type definitions
    - Do NOT include any import statements or require statements
    - Do NOT include any export statements
    - Use useState and other hooks as needed, but keep state structures simple

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
      // JSX with standard Tailwind classes for Airbnb-like styling
      );
    };
  `
}

export async function POST(request: Request) {
  const { query }: { query: string } = await request.json()

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
    console.error('Error in POST /api/runBuildUI:', error)
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
