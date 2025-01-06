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
import { exampleQuery } from './exampleQuery'

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
          {/* <DropdownMenuItem
            onClick={() =>
              handleSelectExample('สถานีชาร์จรถไฟฟ้าที่ใกล้ที่สุด')
            }
          >
            สถานีชาร์จรถไฟฟ้าที่ใกล้ที่สุด
          </DropdownMenuItem> */}
          {
            exampleQuery.map((example, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleSelectExample(example)}
              >
                {example}
              </DropdownMenuItem>
            ))
          }
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExamplesDropDown
