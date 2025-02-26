import { getEmbedding } from "@/lib/embedding"
import { searchQuery, SearchResult, SearchResultPoint } from "../qdrant/searchEmbeddings/route"
import { chooseTheBestContext, extractDocumentIndexID, improveQuery, rephraseQuestion, rewriteQuery, rewriteTextToKnowledge } from "./agents"
import { ragChatPromptBuilder } from "./prompt"
import { serperSearch } from "./serper"
interface SelectedContextParams {
    question: string;
    searchIndex: string;
    searchType?: 'vectordb' | 'serper';
    rephraseType?: 'normal' | 'hyde' |'improve'| 'none';
}
const selectedContextWithLLM = async ({
    question,
    searchIndex,
    searchType = 'vectordb',
    rephraseType = 'none',
}: SelectedContextParams):Promise<{
    selectedContext: string,
    searchResult: SearchResult,
    selectedIndexList: number[],
    query: string
}> => {

    let query = question
    let searchResult: SearchResult = {
        points: []
    }
    if (rephraseType === 'hyde') {
        query = await rewriteQuery(question)
    }
    else if (rephraseType === 'normal') {
        query = await rephraseQuestion(question)
    }
    else if (rephraseType === 'improve') {
        query = await improveQuery(question)
    }
    console.log({ question, query, searchType, rephraseType })
    if (searchType === 'vectordb') {
        const embeddings = await getEmbedding(query)
        searchResult = await searchQuery(searchIndex, embeddings, 7)
    } else if (searchType === 'serper') {
        searchResult = await serperSearch(query, 10)
    }

    const selectedContext = await chooseTheBestContext(searchResult, question)
    const result = await extractDocumentIndexID(selectedContext)
    const selectedIndexList = result?.selectedIndex || []
    return { selectedContext, searchResult, selectedIndexList, query }
}
const rewriteAll = async (points: SearchResultPoint[], question: string) => {
    const newPoints = await Promise.all(points.map(async (point) => {
        const newPayload = await rewriteTextToKnowledge(point.payload?.pageContent as string, question)
        return {
            ...point,
            payload: {
                ...point.payload,
                pageContent: newPayload
            }
        }
    }))
    return newPoints
}

export const getPromptWithContext = async (question: string, searchIndex: string) => {

    let selectedContext: string = '';
    let searchResult: SearchResult = { points: [] };
    let selectedIndexList: number[] = [];
    let rephrasedQuestion = ''
    let selectedContextValue: {
        selectedContext: string,
        searchResult: SearchResult,
        selectedIndexList: number[],
        query: string
    } = {
        selectedContext: '',
        searchResult: { points: [] as SearchResultPoint[] },
        selectedIndexList: selectedIndexList,
        query: ''
    }
    let countImprove = 0
    let query = ''
    rephrasedQuestion = await rephraseQuestion(question)
    while (selectedIndexList.length === 0 && countImprove < 3) {
        console.log(`Count improve: ${countImprove}`)

        if (countImprove > 0) {
            selectedContextValue = await selectedContextWithLLM({
                question: query,
                searchIndex,
                rephraseType:'improve'
            })
        } {
            selectedContextValue = await selectedContextWithLLM({
                question: rephrasedQuestion,
                searchIndex
            })
        }
        
        selectedContext = selectedContextValue.selectedContext
        searchResult = selectedContextValue.searchResult
        selectedIndexList = selectedContextValue.selectedIndexList
        query = selectedContextValue.query
        countImprove++
    }

    if (selectedIndexList.length === 0) {
        console.log('First Search doesn not work. Try HyDE')
        const selectedContextValue = await selectedContextWithLLM({
            question: rephrasedQuestion,
            searchIndex,
            searchType: 'vectordb',
            rephraseType: 'hyde'
        })
        selectedContext = selectedContextValue.selectedContext
        searchResult = selectedContextValue.searchResult
        selectedIndexList = selectedContextValue.selectedIndexList

        if (selectedIndexList.length === 0) {
            console.log('Second Search doesn not work. Try Serper')
            const selectedContextValue = await selectedContextWithLLM({
                question: rephrasedQuestion,
                searchIndex,
                searchType: 'serper'
            })
            selectedContext = selectedContextValue.selectedContext
            searchResult = selectedContextValue.searchResult
            selectedIndexList = selectedContextValue.selectedIndexList
            if (selectedIndexList.length === 0) {
                console.log('Serper doesn not work. Return empty')
                return null
            }
        }
    }
    const rawSearchResult: SearchResult = JSON.parse(JSON.stringify(searchResult))
    searchResult.points = searchResult.points.filter((point, i) => {
        console.log(`filtering....` + point.id)
        return selectedIndexList.includes(Number(point.id))
    })
    console.log(`rewriting....` + searchResult.points.length)
    searchResult.points = await rewriteAll(searchResult.points, question)

    const prompt = ragChatPromptBuilder(searchResult, rephrasedQuestion ? rephrasedQuestion : question)

    return {
        prompt,
        rephrasedQuestion,
        searchResult: rawSearchResult.points.map((point) => {
            return {
                id: point.id,
                payload: point.payload
            }
        }),
        filterdSearchResult: searchResult.points.map((point) => {
            return {
                id: point.id,
                payload: point.payload
            }
        }),
        selectedContext
    }
}