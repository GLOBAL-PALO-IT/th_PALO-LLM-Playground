import type { Metadata } from 'next'
import './globals.css'

import NavBarStack from '@/components/NavBar/NavBarStack'
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: 'LLM Play Ground',
  description: 'LLM Play Ground',
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
