import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as os from 'os'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export enum ModelName {
  GPT4 = 'gpt-4-turbo-preview',
  GPT4O = 'gpt-4o-2024-08-06',
  GPT4O_MINI = 'gpt-4o-mini-2024-07-18',
  Llama3 = 'llama3-70b-8192',
  TEXTEMBEDDING3_LARGE='text-embedding-3-large'
}

export const generateShortUUID = (): string => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Arrow function to get the home directory
// Example usage
// const homeDir = getHomeDirectory();
// console.log(`Home directory: ${homeDir}`);
export const getHomeDirectory = (): string => {
  return os.homedir()
}

// ref: https://stackoverflow.com/questions/51362252/javascript-cosine-similarity-function
// Tags: #cosine, #cosine-similarity
export const calculateCosineSimilarity = (A: number[], B: number[]) => {
  let dotProduct = 0
  let mA = 0
  let mB = 0

  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i]
    mA += A[i] * A[i]
    mB += B[i] * B[i]
  }

  mA = Math.sqrt(mA)
  mB = Math.sqrt(mB)
  const similarity = dotProduct / (mA * mB)

  return similarity
}

// Format date to a user-friendly string
// Example: "2023-01-01T00:00:00.000Z" -> "Jan 1, 2023, 12:00 AM"
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
