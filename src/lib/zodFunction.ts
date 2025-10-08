import { RunnableToolFunctionWithParse } from 'openai/lib/RunnableFunction'
import { JSONSchema } from 'openai/lib/jsonschema'
import { ZodSchema } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * A generic utility function that returns a RunnableFunction
 * you can pass to `.runTools()`,
 * with a fully validated, typesafe parameters schema.
 *
 * You are encouraged to copy/paste this into your codebase!
 */
export function zodFunction<T extends object>({
  function: fn,
  schema,
  description = '',
  name,
}: {
  function: (args: T) => Promise<object>
  schema: ZodSchema<T>
  description?: string
  name?: string
}): RunnableToolFunctionWithParse<T> {
  return {
    type: 'function',
    function: {
      function: fn,
      name: name ?? fn.name,
      description: description,
      parameters: zodToJsonSchema(schema) as JSONSchema,
      parse(input: string): T {
        const obj = JSON.parse(input)
        return schema.parse(obj)
      },
    },
  }
}
