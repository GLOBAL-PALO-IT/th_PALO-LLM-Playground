import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { observeOpenAI } from "langfuse";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { answerQuestion, evaluateAnswer } from './agents';
import { getPromptWithContext } from './qa-prompt';
import { extractEval } from './extract-eval';

// const openai = new OpenAI()
const openai = observeOpenAI(new OpenAI());
export async function POST(request: Request) {
  const {
    messages,
    searchIndex,
    webSearch,
    topK
  }:
    {
      messages: ChatCompletionMessageParam[];
      searchIndex: string,
      webSearch: boolean,
      topK: number
    } =
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
      const result = await getPromptWithContext(question, searchIndex, webSearch,topK)

      if (!result) {
        console.log('Could not generate context for the question')
        return NextResponse.json({ message: 'Could not generate context for the question' }, { status: 400 })
      }
      const { prompt, rephrasedQuestion, searchResult, filterdSearchResult, selectedContext } = result
      console.log('Answering.....')
      const message = await answerQuestion(prompt)
      console.log('Evaluating.....')
      const evaluationText = await evaluateAnswer(message, rephrasedQuestion)
      const totalScore = extractEval(evaluationText)
      // count++

      return NextResponse.json({
        message,
        prompt,
        searchResult,
        totalScore,
        intermediateSteps: {
          rephrasedQuestion,
          evaluationText,
          selectedContext,
          filterdSearchResult
        }
      })
    } else {
      console.log('No search index provided')
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
      const message = completion.choices[0].message.content ? completion.choices[0].message.content : ''
      return NextResponse.json({ message: `No search index provided: ${message}` })
    }

  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

