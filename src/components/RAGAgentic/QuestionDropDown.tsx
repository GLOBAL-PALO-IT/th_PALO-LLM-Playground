'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {questions} from './questions'

interface QuestionDropDownProps {
  setInput: React.Dispatch<React.SetStateAction<string>>
}
const QuestionDropDown: React.FC<QuestionDropDownProps> = ({
  setInput
}) => {
  
  const handleSelectExample = (example: string) => {
    setInput(example)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 border-2 border-blue-500 bg-white text-blue-500 rounded">
          Example Questions
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 m-2 border-2 border-blue-500 rounded-lg">
      <DropdownMenuLabel>Questions</DropdownMenuLabel>
      <div className="max-h-60 overflow-y-auto">
        <DropdownMenuGroup>
          {questions.map((question, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleSelectExample(question)}
            >
              {question}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default QuestionDropDown
