import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar/NavBar'
import NavBarStack from '@/components/NavBar/NavBarStack'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={`h-full ${inter.className}`}>
        <NavBarStack />
        {children}
      </body>
    </html>
  )
}
