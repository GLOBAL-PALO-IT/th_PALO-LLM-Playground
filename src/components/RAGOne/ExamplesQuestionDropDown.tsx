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
import { exportBioContent } from './content/file1'
import { GRI_EM_305 } from './content/file2'

interface ExamplesDropDownProps {
  setInput: React.Dispatch<React.SetStateAction<string>>
}

//   const ExamplesDropDown: React.FC<ExamplesDropDownProps> = ({ setInput }) => {
const ExamplesQuestionDropDown: React.FC<ExamplesDropDownProps> = ({
  setInput,
}) => {
  const handleSelectExample = (example: string) => {
    setInput(example)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 border-2 border-blue-500 bg-white text-blue-500 rounded">
          Select an example Question
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 m-2 border-2 border-blue-500 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Example Prompts</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleSelectExample('Who is expert in NestJS?')}
          >
            Who is expert in NestJS?
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleSelectExample('GRI 305_ Emissions 2016 Question')
            }
          >
            GRI 305_ Emissions 2016 Question
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExamplesQuestionDropDown
