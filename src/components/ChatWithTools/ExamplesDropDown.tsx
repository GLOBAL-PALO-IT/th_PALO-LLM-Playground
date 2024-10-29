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
        <button className="p-1 border-2 border-blue-500 bg-white text-blue-500 rounded">
          Select an example
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 m-2 border-2 border-blue-500 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Example Prompts</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample(
                'I really enjoyed reading NIRAS PASSO - LAW OF Human nature, could you recommend me a book that is similar and tell me why?'
              )
            }
          >
            I really enjoyed reading NIRAS PASSO - LAW OF Human nature, could
            you recommend me a book that is similar and tell me why?
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample(
                `What's the book name "OSWALD - The Echo of Vanishing Shadows." is all about?`
              )
            }
          >
            {`What's the book name "OSWALD - The Echo of Vanishing Shadows." is
            all about?`}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExamplesDropDown
