'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExamplesDropDownProps {
  setInput: React.Dispatch<React.SetStateAction<string>>
}

//   const ExamplesDropDown: React.FC<ExamplesDropDownProps> = ({ setInput }) => {
const ExamplesDropDown: React.FC<ExamplesDropDownProps> = ({ setInput }) => {
  const handleSelectExample = (example: string) => {
    setInput(example)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="mt-2 p-1 border-2 border-blue-500 bg-white text-blue-500 rounded">
          Select an example
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 m-2 border-2 border-blue-500 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Example Prompts</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample('Who is the top client by total payments?')
            }
          >
            Who is the top client by total payments?
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample('List all pending insurance claims')
            }
          >
            List all pending insurance claims
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample(
                'Show me the payment history for policy number f4651c52-c5aa-4a8d-9fd4-d6d270db86b9'
              )
            }
          >
            Show me the payment history for policy number
            f4651c52-c5aa-4a8d-9fd4-d6d270db86b9
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample(
                `Show me the payment history for policy number f4651c52-c5aa-4a8d-9fd4-d6d270db86b9 that has biggest amount`
              )
            }
          >
            Show me the payment history for policy number
            f4651c52-c5aa-4a8d-9fd4-d6d270db86b9 that has biggest amount
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample(
                `What are the policy that Mona Pfeffer is currently holding?`
              )
            }
          >
            What are the policy that Mona Pfeffer is currently holding?
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample(
                `List all claims with amounts higher than $50,000, sorted from highest to lowest`
              )
            }
          >
            List all claims with amounts higher than $50,000, sorted from
            highest to lowest
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExamplesDropDown
