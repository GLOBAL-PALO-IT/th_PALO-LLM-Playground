import { z } from 'zod'

export const ExecutionSchema = z.object({
  Thought: z.string(),
  ActionType: z.enum(['Execute', 'Validate']),
  Action: z.string(),
  Status: z.enum(['Success', 'Stopped', 'Failed', 'In Progress']),
  ChildProcess: z.enum(['spawn', 'exec']),
})

export type ExecutionSchemaType = z.infer<typeof ExecutionSchema>

export const ExecutionWithObsSchema = z.object({
  Thought: z.string(),
  ActionType: z.string(),
  Action: z.string(),
  Observation: z.string(),
})
