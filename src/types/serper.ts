import { z } from "zod";
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