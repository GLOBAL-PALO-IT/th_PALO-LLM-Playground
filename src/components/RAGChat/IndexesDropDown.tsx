'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface IndexesDropDownProps {
  setInput: React.Dispatch<React.SetStateAction<string>>
  collections: string[]
}
const IndexesDropDown: React.FC<IndexesDropDownProps> = ({
  setInput,
  collections
}) => {
  const handleSelectExample = (example: string) => {
    setInput(example)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 border-2 border-blue-500 bg-white text-blue-500 rounded">
          Select Knowledge to Talk To
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 m-2 border-2 border-blue-500 rounded-lg">
      <DropdownMenuLabel>Knowledge Collection</DropdownMenuLabel>
        <DropdownMenuGroup>
        {collections.map((collection) => (
          <DropdownMenuItem
            key={collection}
            onClick={() => handleSelectExample(collection)}
          >
            {collection}
          </DropdownMenuItem>
        ))}
          
          
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default IndexesDropDown
