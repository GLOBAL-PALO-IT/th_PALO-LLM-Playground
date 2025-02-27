import { getEmbedding } from "@/lib/embedding"
import { searchQuery, SearchResult, SearchResultPoint } from "../qdrant/searchEmbeddings/route"
import { checkIfContextRelevantAll, chooseTheBestContext, extractDocumentIndexID, improveQuery, qaPlanner, rephraseQuestion, rewriteAll, rewriteQuery, rewriteTextToKnowledge } from "./agents"
import { ragChatPromptBuilder } from "./prompt"
import { serperSearch } from "./serper"
import { searchQueryByIds } from "./qdrant"
interface SelectedContextParams {
    question: string;
    searchIndex: string;
    searchType?: 'vectordb' | 'serper';
    rephraseType?: 'normal' | 'hyde' | 'improve' | 'none';
    metadata?: Record<string, any>;
    topK?: number
}
const selectedContextWithLLM = async ({
    question,
    searchIndex,
    searchType = 'vectordb',
    rephraseType = 'none',
    metadata,
    topK = 10
}: SelectedContextParams): Promise<{
    selectedContext: string,
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
    if (searchType === 'vectordb') {
        const embeddings = await getEmbedding(query)
        searchResult = await searchQuery(searchIndex, embeddings, topK)
    } else if (searchType === 'serper') {
        query = await improveQuery(question)
        searchResult = await serperSearch(query, topK)
    }
    console.log({ question, query, topK, searchType, rephraseType, metadata })
    console.log('choosing context....')
    // const selectedContext = await chooseTheBestContext(searchResult, question)

    // console.log('extracting context....')
    // const result = await extractDocumentIndexID(selectedContext)
    // const selectedIndexList = result?.selectedIndex || []


    const points = await checkIfContextRelevantAll(searchResult, question, true)
    const pointsWithRelevantAndSupport = points.filter((point) => {
        return ['RELEVANT', 'SUPPORT'].includes(point.payload?.relevantClassification as string)
    })
    const selectedIndexList = pointsWithRelevantAndSupport.map((point) => Number(point.id))
    return { selectedContext: '', searchResult, selectedIndexList, query }
}


export const getPromptWithContext = async (
    question: string,
    searchIndex: string,
    webSearch: boolean,
    topK: number,
    expandCorrectContext: boolean = false
) => {

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

    rephrasedQuestion = await rephraseQuestion(question)
    selectedContextValue = await selectedContextWithLLM({
        question: rephrasedQuestion,
        searchIndex,
        topK
        // rephraseType: 'improve'
    })

    selectedContext = selectedContextValue.selectedContext
    searchResult = selectedContextValue.searchResult
    selectedIndexList = selectedContextValue.selectedIndexList




    if (selectedIndexList.length === 0) {
        console.log('First Search does not work. Try HyDE')
        const selectedContextValue = await selectedContextWithLLM({
            question: rephrasedQuestion,
            searchIndex,
            searchType: 'vectordb',
            rephraseType: 'hyde',
            topK
        })
        selectedContext = selectedContextValue.selectedContext
        searchResult = selectedContextValue.searchResult
        selectedIndexList = selectedContextValue.selectedIndexList

        if (selectedIndexList.length === 0 && webSearch) {
            console.log('Second Search does not work. Try Serper')
            const selectedContextValue = await selectedContextWithLLM({
                question: rephrasedQuestion,
                searchIndex,
                searchType: 'serper',
                topK
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
    if (selectedIndexList.length > 0) {
        console.log(`got context....point ids: ${JSON.stringify(selectedIndexList)}`)
        if(expandCorrectContext){
            console.log(`expanding context....from point ids: ${JSON.stringify(selectedIndexList)}...to`)
            const additionalSelectedIndexList = []
            for (let i = 0; i < selectedIndexList.length; i++) {
                const pointsId = selectedIndexList[0]
                const nextPoint = pointsId + 1
                const prevPoint = pointsId - 1
                if (pointsId === 0) {
                    additionalSelectedIndexList.push(nextPoint)
                } else {
                    // make sure nextpoint is not more thant searchResult.length
                    if (nextPoint < searchResult.points.length) {
                        additionalSelectedIndexList.push(nextPoint);
                    }
                    if (prevPoint >= 0) {
                        additionalSelectedIndexList.push(prevPoint);
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
        selectedContext,
        // plan
    }
}