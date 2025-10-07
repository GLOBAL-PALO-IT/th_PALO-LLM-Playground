interface InstructionStep {
  type: 'Instruction' | 'Thought' | 'ActionType' | 'Action' | 'Observation'
  content: string
  index: number
}

/**
 * Parses instruction text into structured steps
 * @param text - The raw instruction text to parse
 * @returns Array of parsed instruction steps
 */
export const parseInstructionText = (text: string): InstructionStep[] => {
  const lines = text.split('\n')
  const steps: InstructionStep[] = []
  let currentStep: Omit<InstructionStep, 'index'> | null = null
  const typeCounters: Record<InstructionStep['type'], number> = {
    Instruction: 0,
    Thought: 0,
    ActionType: 0,
    Action: 0,
    Observation: 0,
  }

  for (const line of lines) {
    const match = line.match(
      /^(Instruction|Thought|ActionType|Action|Observation):\s(.*)$/
    )
    if (match) {
      if (currentStep) {
        steps.push({ ...currentStep, index: typeCounters[currentStep.type] })
      }
      const type = match[1] as InstructionStep['type']
      typeCounters[type]++
      currentStep = {
        type,
        content: match[2],
      }
    } else if (currentStep) {
      currentStep.content += '\n' + line
    }
  }

  if (currentStep) {
    steps.push({ ...currentStep, index: typeCounters[currentStep.type] })
  }

  return steps
}

/**
 * Extracts bash script from markdown code block
 * @param answer - The text containing bash code block
 * @returns Extracted bash script or empty string if not found
 */
export const extractBashScript = (answer: string): string => {
  if (!answer?.includes('```bash') || !answer?.includes('```')) {
    console.warn('No bash code block found in the answer')
    return ''
  }

  const bashScript = answer.split('```bash')[1].split('```')[0]
  return bashScript.trim()
}
