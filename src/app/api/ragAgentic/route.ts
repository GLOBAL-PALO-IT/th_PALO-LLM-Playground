import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { observeOpenAI } from "langfuse";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { searchQuery, SearchResult } from '../qdrant/searchEmbeddings/route'
import { chooseTheBestContextPrompt, evaluateAnswerPrompt, ragChatPromptBuilder, rawRagChatPromptBuilder, rephraseQuestionPrompt, rewriteTextToKnowledgePrompt } from './prompt'
import { answerQuestion, chooseTheBestContext, evaluateAnswer, extractDocumentIndexID, rephraseQuestion, rewriteQuery, rewriteTextToKnowledge } from './agents';
import { serperSearch } from './serper';

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

    const keepQuery = true
    if (searchIndex && searchIndex !== '') {
      // let count = 0
      // while(keepQuery && count < 3){

      // }
      const result = await getPromptWithContext(question, searchIndex)

      if (!result) {
        console.log('Could not generate context for the question')
        return NextResponse.json({ message: 'Could not generate context for the question' }, { status: 400 })
      }
      const { prompt, rephrasedQuestion, searchResult, selectedContext } = result
      console.log('Answering.....')
      console.log({ prompt })
      const message = await answerQuestion(prompt)
      console.log('Evaluating.....')
      const evaluationText = await evaluateAnswer(message, rephrasedQuestion)
      // count++

      return NextResponse.json({
        message, prompt, searchResult, intermediateSteps: {
          rephrasedQuestion,
          evaluationText,
          selectedContext
        }
      })
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
      const message = completion.choices[0].message
      return NextResponse.json({ message })
    }

  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

const selectedContextWithLLM = async (question: string, searchIndex: string) => {

  const embeddings = await getEmbedding(question)
  const searchResult = await searchQuery(searchIndex, embeddings, 7)
  const selectedContext = await chooseTheBestContext(searchResult, question)
  const result = await extractDocumentIndexID(selectedContext)
  const selectedIndexList = result?.selectedIndex || []
  return { selectedContext, searchResult, selectedIndexList }
}

// const selectedWebContextWithLLM = async (question: string, searchIndex: string) => {

//   const embeddings = await getEmbedding(question)
//   const searchResult = await searchQuery(searchIndex, embeddings, 7)
//   const selectedContext = await chooseTheBestContext(searchResult, question)
//   return { selectedContext, searchResult }
// }

const getPromptWithContext = async (question: string, searchIndex: string) => {

  let selectedContext: string;
  let searchResult: SearchResult;
  let selectedIndexList: number[];
  const rephrasedQuestion = await rephraseQuestion(question)
  const selectedContextValue = await selectedContextWithLLM(rephrasedQuestion, searchIndex)
  selectedContext = selectedContextValue.selectedContext
  searchResult = selectedContextValue.searchResult
  selectedIndexList = selectedContextValue.selectedIndexList


  if (selectedIndexList.length === 0) {
    console.log('First Search doesn not work. Try HyDE')
    const hydeDoc = await rewriteQuery(question)
    console.log(`hydeDoc: ${hydeDoc}`)
    const selectedContextValue = await selectedContextWithLLM(hydeDoc, searchIndex)
    selectedContext = selectedContextValue.selectedContext
    searchResult = selectedContextValue.searchResult
    selectedIndexList = selectedContextValue.selectedIndexList
    
    if (selectedIndexList.length === 0) {
      console.log('Second Search doesn not work. Try Serper')
      const result = await serperSearch(`I am an owner of Isuzu D-Max Maxforce 2025\n\n${rephrasedQuestion}`)
      if (result) {
        const { searchResults } = result
        if (searchResults && searchResults.organic) {
          const rawContext = searchResults.organic.map((organic, index) => {
            return (organic?.title || '') + ' ' + (organic?.snippet || '')
          }).join('\n\n')
          const prompt = rawRagChatPromptBuilder(rawContext, rephrasedQuestion ? rephrasedQuestion : question)
          return {
            prompt,
            rephrasedQuestion,
            searchResult: searchResults.organic.map((organic, index) => {
              return {
                id: index,
                payload: (organic?.title || '') + ' ' + (organic?.snippet || '')
              }
            }),
            selectedContext
          }
        }
      } else {
        return null
      }

    }
  }
  searchResult.points = searchResult.points.filter((point, i) => {
    console.log(`filtering....` + point.id)
    return selectedIndexList.includes(Number(point.id))
  })
  console.log(`rewriting....` + searchResult.points.length)
  searchResult.points = await Promise.all(searchResult.points.map(async (point) => {
    const newPayload = await rewriteTextToKnowledge(point.payload?.pageContent as string, rephrasedQuestion ? rephrasedQuestion : question)
    return {
      ...point,
      payload: {
        ...point.payload,
        pageContent: newPayload
      }
    }
  }))

  const prompt = ragChatPromptBuilder(searchResult, rephrasedQuestion ? rephrasedQuestion : question)

  return {
    prompt,
    rephrasedQuestion,
    searchResult: searchResult.points.map((point) => {
      return {
        id: point.id,
        payload: point.payload
      }
    }),
    selectedContext
  }



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