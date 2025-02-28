import axios from 'axios';
import { z } from "zod";
import { SearchResult } from '@/types/qdrant'
import { SerperData, serperDataSchema } from '@/types/serper';

const mapSerperDataToSearchResult = (serperData: SerperData): SearchResult => {
  return {
    points: (serperData?.organic ?? []).map((item, index) => ({
      id: index,
      version: 1,
      score: 1 - (item?.position ?? 0) / 100, // Convert position to a score between 0-1
      payload: { pageContent: (item?.title || '') + ' ' + (item?.snippet || '') }
    }))
  };
}
export const serperSearch = async (query: string, topK: number = 3): Promise<SearchResult> => {
  let data = JSON.stringify({
    "q": query,
    // "location": "Thailand",
    // "gl": "th",
    "num": topK 
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://google.serper.dev/search',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json'
    },
    data: data
  };
  try {
    const response = await axios.request(config);
    // console.log(JSON.stringify(response.data));
    const serperData = serperDataSchema.parse(response.data)
    const searchResults = mapSerperDataToSearchResult(serperData)
    return searchResults
  } catch (e) {
    console.error(e)
    return {
      points: []
    }
  }
}