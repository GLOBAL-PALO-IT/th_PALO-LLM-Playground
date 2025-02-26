import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { observeOpenAI } from "langfuse";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { searchQuery, SearchResult, SearchResultPoint } from '../qdrant/searchEmbeddings/route'
import { chooseTheBestContextPrompt, evaluateAnswerPrompt, ragChatPromptBuilder, rawRagChatPromptBuilder, rephraseQuestionPrompt, rewriteTextToKnowledgePrompt } from './prompt'
import { answerQuestion, chooseTheBestContext, evaluateAnswer, extractDocumentIndexID, rephraseQuestion, rewriteQuery, rewriteTextToKnowledge } from './agents';
import { serperSearch } from './serper';
import { getPromptWithContext } from './qa-prompt';

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
        console.log('Could not generate context for the question')
        return NextResponse.json({ message: 'Could not generate context for the question' }, { status: 400 })
      }
      const { prompt, rephrasedQuestion, searchResult,filterdSearchResult, selectedContext } = result
      console.log('Answering.....')
      console.log({ prompt })
      const message = await answerQuestion(prompt)
      console.log('Evaluating.....')
      const evaluationText = await evaluateAnswer(message, rephrasedQuestion)
      // count++

      return NextResponse.json({
        message, 
        prompt, 
        searchResult, 
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
      return NextResponse.json({ message:`No search index provided: ${message}` })
    }

  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

