import type { Metadata } from 'next'
import './globals.css'

import NavBarStack from '@/components/NavBar/NavBarStack'
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: 'LLM Play Ground',
    template: '%s | LLM Play Ground'
  },
  description: 'Applied LLM Platform - Explore 20+ LLM examples across Agents, Chat, RAG, and Evaluation',
  keywords: ['LLM', 'AI', 'Chat', 'RAG', 'Agents', 'OpenAI', 'Machine Learning'],
  authors: [{ name: 'Applied LLM Platform' }],
  creator: 'Applied LLM Platform',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://applied-llm-platform.com',
    title: 'LLM Play Ground',
    description: 'Applied LLM Platform - Explore 20+ LLM examples across Agents, Chat, RAG, and Evaluation',
    siteName: 'LLM Play Ground',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLM Play Ground',
    description: 'Applied LLM Platform - Explore 20+ LLM examples',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans">
        <NavBarStack />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
