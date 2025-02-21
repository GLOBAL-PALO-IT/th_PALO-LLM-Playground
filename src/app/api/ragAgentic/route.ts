import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { observeOpenAI } from "langfuse";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { searchQuery } from '../qdrant/searchEmbeddings/route'
import { chooseTheBestContextPrompt, ragChatPromptBuilder, rephraseQuestionPrompt, rewriteTextToKnowledgePrompt } from './prompt'
// const openai = new OpenAI()
const openai = observeOpenAI(new OpenAI());
export async function POST(request: Request) {
  const { messages, searchIndex }: { messages: ChatCompletionMessageParam[]; searchIndex: string } =
    await request.json()
  // console.log(messages)
  try {
    const latestMessage = messages[messages.length - 1]
    if (!latestMessage.content) {
      return NextResponse.json({ output: 'Message content cannot be empty' }, { status: 400 })
    }
    const question = latestMessage.content
    //if text is empty return error
    if (typeof question !== 'string' || question.length === 0) {
      return NextResponse.json({ output: 'Please enter a valid text' }, { status: 400 })
    }
    

    if (searchIndex && searchIndex !== '') {
      const result = await getPromptWithContext(question, searchIndex)
      
      if (!result) {
        return NextResponse.json({ output: 'Could not generate context for the question' }, { status: 400 })
      }

      const { prompt, searchResult,intermediateSteps } = result

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
        frequency_penalty: 0,
        presence_penalty: 0,
      })

      // console.log(completion.choices[0])
      const message = completion.choices[0].message
      return NextResponse.json({ message, prompt, searchResult, intermediateSteps })
    } else {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
        model: ModelName.GPT4O,
        temperature: 0.2,
        top_p: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0,
      })
      // console.log(completion.choices[0])
      const message = completion.choices[0].message
      return NextResponse.json({ message })
    }

  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
const rewriteTextToKnowledge = async(text:string) => {
  // rewriteTextToKnowledgePrompt
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: rewriteTextToKnowledgePrompt(text),
      },
    ],
    model: ModelName.GPT4O,
    temperature: 0.2,
    top_p: 0.2,
  })
  return completion.choices[0].message.content
}

const chooseTheBestContext = async (context: string[], question: string) => {
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
  return completion.choices[0].message.content
}
// rephraseQuestionPrompt
const rephraseQuestion = async (question: string) => {
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
  return completion.choices[0].message.content
}

const getPromptWithContext = async (question: string, searchIndex: string) => {
  const rephrasedQuestion = await rephraseQuestion(question)
  const embeddings = await getEmbedding(rephrasedQuestion?rephrasedQuestion:question)
  const searchResult = await searchQuery(searchIndex, embeddings, 5)
  const searchResultText = searchResult.points.map((point) => point.payload?.pageContent as string)
  const selectedContext = await chooseTheBestContext(searchResultText, question)
  // parse selectedContext to int
  const selectedContextInt = selectedContext?.split(',').map((item) => parseInt(item))
  if (!selectedContextInt) {
    return null
  }
  // filter searchResultText with selectedContextInt
  const selectedContextText = searchResultText.filter((_, i) => selectedContextInt.includes(i))
  // console.log(`Rewriting Length: ${selectedContextText.length}`)
  // const rewriteSelectedContextText = await Promise.all(selectedContextText.map(text => rewriteTextToKnowledge(text)))
  // const validContexts = rewriteSelectedContextText.filter((text): text is string => text !== null)
  // if (validContexts.length === 0) {
  //   return null
  // }
  const prompt = await ragChatPromptBuilder(selectedContextText, rephrasedQuestion?rephrasedQuestion:question)
  // console.log({selectedContextText})
  return { prompt, searchResult, intermediateSteps: [{selectedContext,selectedContextText,rephrasedQuestion}] }
  
}

const getEmbedding = async (text: string) => {
  if (text.length > 0) {
    text = text.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
    const openai = new OpenAI()
    const result = await openai.embeddings.create({
      input: text,
      model: ModelName.TEXTEMBEDDING3_LARGE,
    })

    const embeddings = result.data
    return embeddings[0].embedding
  } else {
    return []
  }

}