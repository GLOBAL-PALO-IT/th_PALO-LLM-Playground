import Chat from '@/components/Chat/Chat'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Basic Chat',
  description: 'Basic OpenAI Chat API usage with streaming support for real-time responses',
}

const Page = () => {
  return <Chat />
}

export default Page
