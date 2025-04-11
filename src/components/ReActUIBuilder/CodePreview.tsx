import React, { useState } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'

const scope = { React, useState }

const extractCodeFromLLMResponse = (response: string): string => {
  // Extract code between "// Code starts here" and "// Code ends here"
  const match = response.match(
    /\/\/ Code starts here([\s\S]*?)\/\/ Code ends here/
  )
  if (!match) return '// No valid code block found'

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
    code += `\n\n// Unable to detect component name for render()`
  }

  return code.trim()
}

const CodePreview = ({ llmResponse }: { llmResponse: string }) => {
  console.log({ code: extractCodeFromLLMResponse(llmResponse) })

  if (!llmResponse) {
    return null
  }

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">React Code Preview</h2>

      <LiveProvider
        code={extractCodeFromLLMResponse(llmResponse)}
        scope={scope}
        noInline
      >
        {/* <LiveEditor
          onChange={setCode}
          className="border p-2 rounded bg-gray-100"
        /> */}
        <LiveError className="text-red-500 mt-2" />
        <div className="border p-4 rounded bg-gray-50 mt-4">
          <LivePreview />
        </div>
      </LiveProvider>
    </div>
  )
}

export default CodePreview
