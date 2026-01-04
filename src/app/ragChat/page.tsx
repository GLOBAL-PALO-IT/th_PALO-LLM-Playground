import RAGChat from '@/components/RAGChat/RAGChat'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RAG Chat',
  description: 'RAG with Chat - Integrate RAG with Chat by fetching data from Qdrant with streaming support',
}

const Page = () => {
  return <RAGChat />
}

export default Page
