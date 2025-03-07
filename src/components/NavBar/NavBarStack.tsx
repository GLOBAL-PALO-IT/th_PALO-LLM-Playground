'use client'

import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { menuItems } from './mockMenu'

const NavBarStack = () => {
  const pathName = usePathname()

  return (
    <nav className="">
      <div className="px-4">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden"></div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Image
                height={32}
                width={127}
                src="https://www.palo-it.com/hubfs/colour_logo.svg"
                alt="Company"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    {/* Agents */}
                    <NavigationMenuTrigger>Agents</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="/"
                            >
                              {/* <Icons.logo className="h-6 w-6" /> */}
                              <div className="mb-2 text-lg font-medium">
                                Agents
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Example that show you how to work with agents
                                and environments feedback
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        {/* /react */}
                        <ListItem href="/react" title="Shell Agent">
                          Shell Agent that can work with shell script and
                          support complex query such as coding and DevOps.
                          Reminder: This is actually execute the shell script in
                          the server side.
                        </ListItem>
                        {/*  /agenticPattern1*/}
                        <ListItem
                          href="/agenticPattern1"
                          title="Agent Pattern 1"
                        >
                          Agent Pattern 1 that can work with shell script and
                          support complex query such as coding and DevOps.
                          Reminder: This is actually execute the shell script in
                          the server side.
                        </ListItem>
                        {/*  /agenticPattern2*/}
                        <ListItem
                          href="/agenticPattern2"
                          title="Agent Pattern 2"
                        >
                          Agent Pattern 2 that can work with shell script and
                          support complex query such as coding and DevOps.
                          Reminder: This is actually execute the shell script in
                          the server side.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  {/* Chat */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Chat</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="/chat"
                            >
                              {/* <Icons.logo className="h-6 w-6" /> */}
                              <div className="mb-2 text-lg font-medium">
                                Chats
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Example that shows how to work with chat and
                                tools with multiple apis
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <ListItem href="/chat" title="Chat">
                          how messages work in the chat
                        </ListItem>
                        <ListItem href="/chatWithTools" title="Chat With Tools">
                          calling book database. Chat is becoming Agent.
                        </ListItem>
                        <ListItem
                          href="/chatInsurance"
                          title="Chat With Insurance API"
                        >
                          calling insurance API(clients, claims, policies,
                          payments). Agent is connecting to real world.
                        </ListItem>
                        <ListItem
                          href="/chatMenu"
                          title="Chat that suggest menus"
                        >
                          Chat that can suggest menus
                        </ListItem>
                        <ListItem href="/chatVoice" title="Chat Voice">
                          calling Realtime Voice Chat.
                        </ListItem>
                        <ListItem href="/phoneCall" title="Phone Call">
                          calling real phone number
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  {/* RAG */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>RAG</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="/chat"
                            >
                              {/* <Icons.logo className="h-6 w-6" /> */}
                              <div className="mb-2 text-lg font-medium">
                                RAG
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Retrieval Augmented Generation Example -
                                visualize how chunking, embedding and vector
                                search works
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <ListItem href="/ragRawChunk" title="RAG Chunking Raw Text">
                          shows how to chunk raw text into smaller pieces and
                          embedding them
                        </ListItem>
                        <ListItem href="/ragQdrant" title="RAG with Qdrant">
                          show how the chunk actually works with Qdrant for
                          similarity search. Required Qdrant docker to start up
                        </ListItem>
                        <ListItem href="/ragChat" title="RAG with Chat">
                          show how to integrate RAG with Chat in prompt
                        </ListItem>
                        <ListItem href="/ragGraph" title="Graph RAG">
                          showcase of Graph RAG Construction
                        </ListItem>
                        <ListItem href="/ragGraphPipeline" title="Graph RAG Pipeline">
                          showcase of Graph RAG Construction Pipeline using LangChain
                        </ListItem>
                        <ListItem href="/ragChatGraph" title="Graph RAG Chat">
                          showcase of Graph RAG Chat
                        </ListItem>
                        <ListItem href="/ragAgentic" title="Agentic RAG">
                          showcase of Agentic RAG
                        </ListItem>
                        <ListItem href="/sentenceSim" title="Sentence Similarity">
                          showcase of Sentence Similarity
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  {/* Evaluation */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Evaluation</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="/chat"
                            >
                              {/* <Icons.logo className="h-6 w-6" /> */}
                              <div className="mb-2 text-lg font-medium">
                                Evaluation
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Example of how to evaluate the performance of LLM Application
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        {/* /eval */}
                        <ListItem href="/documentPipeline" title="Document Pipeline">
                          Document Pipeline
                        </ListItem>
                        {/* /eval rag */}
                        <ListItem href="/evalRag" title="Evaluation RAG">
                          Evaluation of RAG Application
                        </ListItem>
                        {/* /eval pipeline */}
                        <ListItem href="/evalPipeline" title="Evaluation Pipeline">
                          Evaluation of Pipeline Application
                        </ListItem>
                        {/* /eval dataset */}
                        <ListItem href="/evalDataset" title="Evaluation Dataset">
                          Evaluation Dataset Creation
                        </ListItem>
                        {/* /eval model */}
                        <ListItem href="/evalModel" title="Evaluation Model">
                          Evaluation Model Creation
                        </ListItem>
                      </ul>

                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  {/* Menus */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Menus</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 lg:w-[500px] md:w-[400px] md:grid-cols-2 lg:grid-cols-3">
                        {menuItems.map((category) => (
                          <li key={category.categoryId}>
                            <h3 className="font-bold mb-2">{category.category}</h3>
                            <ul className="space-y-2">
                              {category.items.map((item) => (
                                <ListItem key={item.id} href={`/menu${category.categoryId}/item${item.id}`} title={item.title}>
                                  {item.description}
                                </ListItem>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'

export default NavBarStack
