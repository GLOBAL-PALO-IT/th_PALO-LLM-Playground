import axios from 'axios';
import { z } from "zod";
import { SearchResult } from '../qdrant/searchEmbeddings/route'
const searchParametersSchema = z.object({
  q: z.string().optional(),
  gl: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  engine: z.string().optional()
}).optional();

const organicItemSchema = z.object({
  title: z.string().optional(),
  link: z.string().url().optional(),
  snippet: z.string().optional(),
  attributes: z.object({
    Missing: z.string().optional()
  }).optional(),
  position: z.number().optional()
}).optional();

const imageItemSchema = z.object({
  title: z.string().optional(),
  imageUrl: z.string().url().optional(),
  link: z.string().url().optional()
}).optional();

const peopleAlsoAskSchema = z.object({
  question: z.string().optional(),
  snippet: z.string().optional(),
  title: z.string().optional(),
  link: z.string().url().optional()
}).optional();

export const serperDataSchema = z.object({
  searchParameters: searchParametersSchema.optional(),
  organic: z.array(organicItemSchema).optional(),
  images: z.array(imageItemSchema).optional(),
  peopleAlsoAsk: z.array(peopleAlsoAskSchema).optional()
}).optional();

// type of serperDataSchema
export type SerperData = z.infer<typeof serperDataSchema>;
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