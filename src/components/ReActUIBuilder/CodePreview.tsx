import React, { useState } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'

const scope = { React, useState }

// Constants for code extraction
const CODE_BLOCK_START = '// Code starts here'
const CODE_BLOCK_END = '// Code ends here'
const NO_CODE_FOUND_MESSAGE = '// No valid code block found'
const UNABLE_TO_DETECT_COMPONENT = '// Unable to detect component name for render()'

/**
 * Extracts and processes code from LLM response
 * @param response - The raw LLM response string
 * @returns Processed code ready for live preview
 */
const extractCodeFromLLMResponse = (response: string): string => {
  // Extract code between "// Code starts here" and "// Code ends here"
  const codeBlockRegex = new RegExp(
    `${CODE_BLOCK_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${CODE_BLOCK_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
  )
  const match = response.match(codeBlockRegex)
  
  if (!match) {
    return NO_CODE_FOUND_MESSAGE
  }

  let code = match[1].trim()

  // Remove all import and require statements
  code = code
    .split('\n')
    .filter(
      (line) => !line.trim().startsWith('import') && !line.includes('require')
    )
    .join('\n')

  // Detect component name from `const X = () =>` or `function X()`
  const componentMatch = code.match(/(?:const|function)\s+(\w+)\s*=\s*\(/)
  const componentName = componentMatch?.[1]

  // Remove "export default ComponentName;" if it exists
  code = code.replace(/export\s+default\s+\w+;?/, '')

  // Append render() call
  if (componentName) {
    code += `\n\nrender(<${componentName} />);`
  } else {
    code += `\n\n${UNABLE_TO_DETECT_COMPONENT}`
  }

  return code.trim()
}

/**
 * CodePreview component displays live preview of React code from LLM response
 * @param llmResponse - The raw response from the LLM containing React code
 */
const CodePreview = ({ llmResponse }: { llmResponse: string }) => {
  const extractedCode = extractCodeFromLLMResponse(llmResponse)
  console.log('Extracted code for preview:', extractedCode)

  if (!llmResponse) {
    return null
  }

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">React Code Preview</h2>

      <LiveProvider
        code={extractedCode}
        scope={scope}
        noInline
      >
        <LiveError className="text-red-500 mt-2" />
        <div className="border p-4 rounded bg-gray-50 mt-4">
          <LivePreview />
        </div>
      </LiveProvider>
    </div>
  )
}

export default CodePreview
