'use client'

import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import neo4j, { Node, Relationship } from 'neo4j-driver'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import './chat.css'
import { Document } from '@langchain/core/documents'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import React from 'react'
import {
  FaEye,
  FaEyeSlash,
  FaFileDownload,
  FaInfoCircle,
  FaMagic,
  FaRegClipboard,
} from 'react-icons/fa'
import {
  JsonView,
  allExpanded,
  collapseAllNested,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ChainValues } from '@langchain/core/utils/types'

const RAGChat = () => {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFormattedPrompt, setShowFormattedPrompt] = useState(true)
  const [showMetadata, setShowMetadata] = useState(false)
  const [neo4jConnection, setNeo4jConnection] = useState<string>('')
  const [intermediateSteps, setIntermediateSteps] = useState<[]>([])
  const [rawText, setRawText] = useState<string>('')
  const [docs, setDocs] = useState<Document[]>([])
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add the user's message to the chat
    const newMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: input,
    }
    setMessages((prev) => [...prev, newMessage])

    // Clear the input field
    setInput('')

    setIsLoading(true)

    try {
      const response = await fetch('/api/graph/chatTools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      })
      const { chainResponse, rawText, docs, message }: { chainResponse: ChainValues, rawText: string, docs: Document[], message: ChatCompletionMessageParam[] } = await response.json()
      console.log({ chainResponse })
      if (message) {
        setMessages(message)
      } else {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: chainResponse.result
        }])
        setIntermediateSteps(chainResponse.intermediateSteps)
        setRawText(rawText)
        setDocs(docs)
      }

    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const connectNeo4j = useCallback(async () => {
    const URI = 'neo4j://localhost:7687'
    const USER = 'neo4j'
    const PASSWORD = 'yourpassword'
    let driver
    try {
      driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
      const serverInfo = await driver.getServerInfo()
      console.log('Connection established')
      console.log(serverInfo)
      setNeo4jConnection(JSON.stringify(serverInfo))
    } catch (err) {
      console.log(`Connection error\n${err}\nCause: ${err}`)
    }
  }, [])

  useEffect(() => {
    connectNeo4j()
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Prevents new line when pressing Enter
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 flex flex-row content-center items-center">
        <h1 className="text-2xl font-bold">Graph RAG Chat</h1>
        <div className="px-4 flex flex-row">
          {showFormattedPrompt ? (
            <button onClick={() => setShowFormattedPrompt(false)}>
              <FaMagic className="m-1" />
            </button>
          ) : (
            <button onClick={() => setShowFormattedPrompt(true)}>
              <FaMagic className="m-1" />
            </button>
          )}
          {showMetadata ? (
            <button onClick={() => setShowMetadata(false)}>
              <FaEye className="m-1" />
            </button>
          ) : (
            <button onClick={() => setShowMetadata(true)}>
              <FaEyeSlash className="m-1" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
        <Card className="p-4 w-full overflow-y-auto">
          {/* Chat history */}
          <div className="flex flex-col p-4 max-h-[55vh] h-[60vh] overflow-auto space-y-2 p-4 border-2 border-gray-300 rounded-lg">
            {/* whitespace-pre-wrap break-words  */}
            {showFormattedPrompt ? (
              messages?.map((message, index) => {
                let messageMode:
                  | 'text'
                  | 'tool'
                  | 'object'
                  | 'assistant-tool'
                  | undefined = undefined

                if (
                  message.role === 'assistant' &&
                  message.tool_calls &&
                  message.tool_calls.length > 0
                ) {
                  messageMode = 'assistant-tool'
                } else if (message.role === 'tool' && message?.content) {
                  messageMode = 'tool'
                } else if (typeof message.content === 'string') {
                  messageMode = 'text'
                } else if (message?.content) {
                  messageMode = 'object'
                }
                return (
                  <div
                    key={index}
                    className={`whitespace-pre-wrap break-words message-bubble ${message.role === 'user' || message.role === 'tool' ? 'human-message bg-blue-200' : 'ai-message bg-green-200'} ${message.role === 'user' || message.role === 'tool' ? 'ml-auto' : 'mr-auto'}`}
                  >
                    <h3 className="text-sm font-bold">{message.role}</h3>
                    {messageMode === 'text' &&
                      typeof message?.content === 'string' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      <></>
                    )}
                    {messageMode === 'object' ? (
                      <JsonView
                        data={message.content || {}}
                        shouldExpandNode={collapseAllNested}
                        style={darkStyles}
                      />
                    ) : (
                      <></>
                    )}
                    {messageMode === 'assistant-tool' &&
                      message.role === 'assistant' &&
                      message.tool_calls &&
                      message.tool_calls.length > 0 ? (
                      // <span>
                      //   {message.role}:{JSON.stringify(message.tool_calls)}
                      // </span>
                      <JsonView
                        data={message.tool_calls}
                        shouldExpandNode={collapseAllNested}
                        style={darkStyles}
                      />
                    ) : (
                      <> </>
                    )}
                    {messageMode === 'tool' && message?.content ? (
                      <JsonView
                        data={JSON.parse(message.content.toString())}
                        shouldExpandNode={collapseAllNested}
                        style={darkStyles}
                      />
                    ) : (
                      <></>
                    )}
                    {/* <span>{messageMode} </span>
                    <JsonView
                      data={message}
                      shouldExpandNode={allExpanded}
                      style={darkStyles}
                    /> */}
                  </div>
                )
              })
            ) : (
              <JsonView
                data={messages}
                shouldExpandNode={collapseAllNested}
                style={darkStyles}
              />
            )}
          </div>

          {/* Input and Send Button */}
          <div className="flex flex-row max-h-[55vh] h-[60vh] mt-5">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full h-[20vh] p-2 border-2 border-gray-300 rounded-lg flex-1"
              rows={3} // Adjust the number of rows for height
              onKeyDown={handleKeyDown} // Tie Enter key to submission
            />
            <Button
              type="submit"
              onClick={handleSendMessage}
              className="bg-blue-500 items-center justify-center ml-2"
              disabled={isLoading}
            >
              Send
              {isLoading && <Spinner className="flex ml-1" />}
            </Button>
          </div>
        </Card>
        {showMetadata && <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-1 mt-1">Metadata</h3>
          <h3 className="text-l font-bold mb-1 mt-1">Intermediate Result</h3>
          {intermediateSteps && (
            <div className="mt-1 max-h-[50vh] overflow-y-auto">
              <h2>Intermediate Steps Size {intermediateSteps.length}</h2>
              {intermediateSteps.map((doc, index) => (
                <div key={index} className='cursor-pointer'>
                  <JsonView
                    data={doc}
                    shouldExpandNode={collapseAllNested}
                    style={darkStyles}
                  />
                  <hr className="border-t-2 border-blue-900 my-4" />
                </div>
              ))}
            </div>
          )}
          <hr className="border-t-2 border-blue-900 my-1" />
          <h3 className="text-l font-bold mb-1 mt-1">Raw Text</h3>
          {rawText && (
            <div className="mt-1 max-h-[10vh] overflow-y-auto">
              <h2>Raw Text Size {rawText.length}</h2>
              <p>{rawText}</p>
            </div>
          )}
          <hr className="border-t-2 border-blue-900 my-1" />
          <h3 className="text-l font-bold mb-1 mt-1">Docs</h3>
          {docs && (
            <div className="mt-1 max-h-[50vh] overflow-y-auto">
              <h2>Docs Size {docs.length}</h2>
              {docs.map((doc, index) => (
                <div key={index} className='cursor-pointer'>
                  <JsonView
                    data={doc}
                    shouldExpandNode={collapseAllNested}
                    style={darkStyles}
                  />
                  <hr className="border-t-2 border-blue-900 my-1" />
                </div>
              ))}
            </div>
          )}
        </Card>}
      </div>

    </div>
  )
}

export default RAGChat
