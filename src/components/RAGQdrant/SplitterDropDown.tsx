'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SplitterDropDownProps {
  setInput: React.Dispatch<React.SetStateAction<string>>
  selectedSplitter: string
}
const SplitterDropDown: React.FC<SplitterDropDownProps> = ({
  setInput,  
  selectedSplitter
}) => {
  const splitters = ['token', 'character','page', 'pageToken']
  const handleSelectExample = (example: string) => {
    setInput(example)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 border-2 border-blue-500 bg-white text-blue-500 rounded">
          Select Splitter {selectedSplitter}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 m-2 border-2 border-blue-500 rounded-lg">
      <DropdownMenuLabel>Chunk API</DropdownMenuLabel>
        <DropdownMenuGroup>
        {splitters.map((splitter) => (
          <DropdownMenuItem
            key={splitter}
            onClick={() => handleSelectExample(splitter)}
          >
            {splitter}
          </DropdownMenuItem>
        ))}
          
          
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SplitterDropDown
