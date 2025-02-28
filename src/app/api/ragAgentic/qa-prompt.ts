import { getEmbedding } from "@/lib/embedding"
import { SearchResult, SearchResultPoint } from "@/types/qdrant";
import { searchQuery } from "@/lib/qdrant"
import { checkIfContextRelevantAll, chooseTheBestContext, extractDocumentIndexID, improveQuery, qaPlanner, rephraseQuestion, rewriteAll, rewriteQuery, rewriteTextToKnowledge } from "./agents"
import { ragChatPromptBuilder } from "./prompt"
import { serperSearch } from "./serper"
import { searchQueryByIds } from "../../../lib/qdrant"
interface SelectedContextParams {
    searchResultIds?: number[],
    question: string;
    searchIndex: string;
    searchType?: 'vectordb' | 'serper';
    rephraseType?: 'normal' | 'hyde' | 'improve' | 'none';
    metadata?: Record<string, any>;
    topK?: number
    ligthMode?: boolean
}
const selectedContextWithLLM = async ({
    searchResultIds = [],
    question,
    searchIndex,
    searchType = 'vectordb',
    rephraseType = 'none',
    metadata,
    topK = 10,
    ligthMode = true
}: SelectedContextParams): Promise<{
    searchResult: SearchResult,
    selectedIndexList: number[],
    query: string,
}> => {
    // question can't be empty
    if (question === '') {
        throw new Error('selectedContextWithLLM question can not be empty')
    }

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

    // query can't be empty
    if (query === '') {
        throw new Error('selectedContextWithLLM query can not be empty')
    }
    if(searchType === 'serper' && searchResultIds.length >0){
        console.warn('serper search does not need searchResultIds')
    }
    if (searchType === 'vectordb') {
        const embeddings = await getEmbedding(query)
        searchResult = await searchQuery(searchIndex, embeddings, topK, searchResultIds)
    } else if (searchType === 'serper') {
        query = await improveQuery(question)
        searchResult = await serperSearch(query, topK)
    }
    console.log({ question, query, topK, searchType, rephraseType, metadata })
    console.log('choosing context....')


    const points = await checkIfContextRelevantAll(searchResult, question, ligthMode)
    const pointsWithRelevantAndSupport = points.filter((point) => {
        return ['RELEVANT', 'SUPPORT'].includes(point.payload?.relevantClassification as string)
    })
    const selectedIndexList = pointsWithRelevantAndSupport.map((point) => Number(point.id))
    return { searchResult, selectedIndexList, query }
}


export const getPromptWithContext = async (
    question: string,
    searchIndex: string,
    webSearch: boolean,
    topK: number,
    expandCorrectContext: boolean = false,
    expandCorrectContextLength: number = 2,
    ligthMode: boolean=false,
    improveLimit: number=3
) => {
    console.log({improveLimit})
    let searchResultIds: number[] = []
    let searchResult: SearchResult = { points: [] };
    let selectedIndexList: number[] = [];
    let rephrasedQuestion = ''
    let selectedContextValue: {
        searchResult: SearchResult,
        selectedIndexList: number[],
        query: string
    } = {
        searchResult: { points: [] as SearchResultPoint[] },
        selectedIndexList: selectedIndexList,
        query: ''
    }


    rephrasedQuestion = await rephraseQuestion(question)
    let loopQuery = rephrasedQuestion
    let countImprove = 0
    while (countImprove < improveLimit && selectedIndexList.length === 0) {
        selectedContextValue = await selectedContextWithLLM({
            ligthMode,
            searchResultIds,
            question: loopQuery,
            searchIndex,
            topK,
            rephraseType: countImprove === 0 ? 'none' : 'improve'
        })

        searchResult = selectedContextValue.searchResult
        selectedIndexList = selectedContextValue.selectedIndexList
        loopQuery = selectedContextValue.query
        searchResultIds = [...searchResultIds, ...searchResult.points.map((point) => Number(point.id))]
        countImprove++
    }

    if (selectedIndexList.length === 0) {
        console.log('First Search does not work. Try HyDE')
        const selectedContextValue = await selectedContextWithLLM({
            ligthMode,
            searchResultIds,
            question: rephrasedQuestion,
            searchIndex,
            searchType: 'vectordb',
            rephraseType: 'hyde',
            topK
        })

        searchResult = selectedContextValue.searchResult
        selectedIndexList = selectedContextValue.selectedIndexList
        searchResultIds = [...searchResultIds, ...searchResult.points.map((point) => Number(point.id))]

        if (selectedIndexList.length === 0 && webSearch) {
            console.log('Second Search does not work. Try Serper')
            const selectedContextValue = await selectedContextWithLLM({
                ligthMode,
                question: rephrasedQuestion,
                searchIndex,
                searchType: 'serper',
                topK
            })

            searchResult = selectedContextValue.searchResult
            selectedIndexList = selectedContextValue.selectedIndexList
            if (selectedIndexList.length === 0) {
                console.log('Serper doesn not work. Return empty')
                return null
            }
        }
    }
    const rawSearchResult: SearchResult = JSON.parse(JSON.stringify(searchResult))
    if (selectedIndexList.length > 0) {
        console.log(`got context....point ids: ${JSON.stringify(selectedIndexList)}`)
        if (expandCorrectContext) {
            console.log(`expanding context....from point ids: ${JSON.stringify(selectedIndexList)}...to`)
            const additionalSelectedIndexList = []
            for (let i = 0; i < selectedIndexList.length; i++) {
                const pointsId = selectedIndexList[i]
                // Add points within the expandCorrectContextLength range
                for (let offset = -expandCorrectContextLength; offset <= expandCorrectContextLength; offset++) {
                    // Skip the point itself (when offset is 0)
                    if (offset === 0) continue;
                    
                    const adjacentPoint = pointsId + offset;
                    // Check if the adjacent point is within valid bounds
                    if (adjacentPoint >= 0 && adjacentPoint < searchResult.points.length) {
                        additionalSelectedIndexList.push(adjacentPoint);
                    }
                }
            }
            const additionalSearchResult = await searchQueryByIds(searchIndex, additionalSelectedIndexList)

            selectedIndexList = [...selectedIndexList, ...additionalSelectedIndexList]
            searchResult.points = [...searchResult.points, ...additionalSearchResult]
        }

        searchResult.points = searchResult.points.filter((point, i) => {
            return selectedIndexList.includes(Number(point.id))
        })
        console.log(`filtered....point ids: ${JSON.stringify(selectedIndexList)}`)
        console.log(`rewriting....${searchResult.points.length} docs`)
        searchResult.points = await rewriteAll(searchResult.points, question)
    }


    const prompt = ragChatPromptBuilder(searchResult, rephrasedQuestion ? rephrasedQuestion : question)

    return {
        prompt,
        rephrasedQuestion,
        searchResult: rawSearchResult.points,
        filterdSearchResult: searchResult.points,
    }
}