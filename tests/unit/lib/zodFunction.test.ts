import { describe, it, expect } from '@jest/globals';
import { zodFunction } from '@/lib/zodFunction';
import { z } from 'zod';

describe('zodFunction', () => {
  describe('basic functionality', () => {
    it('should create a RunnableToolFunction with correct structure', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const testFunction = async (args: { name: string; age: number }) => {
        return { result: `${args.name} is ${args.age} years old` };
      };

      const runnableFunction = zodFunction({
        function: testFunction,
        schema,
        name: 'testFunc',
        description: 'A test function',
      });

      expect(runnableFunction.type).toBe('function');
      expect(runnableFunction.function.name).toBe('testFunc');
      expect(runnableFunction.function.description).toBe('A test function');
      expect(runnableFunction.function.parameters).toBeDefined();
    });

    it('should use function name as default when name is not provided', () => {
      const schema = z.object({
        value: z.string(),
      });

      const namedFunction = async (args: { value: string }) => {
        return { value: args.value };
      };

      const runnableFunction = zodFunction({
        function: namedFunction,
        schema,
      });

      expect(runnableFunction.function.name).toBe('namedFunction');
    });

    it('should have empty description when not provided', () => {
      const schema = z.object({
        value: z.string(),
      });

      const testFunction = async (args: { value: string }) => {
        return { value: args.value };
      };

      const runnableFunction = zodFunction({
        function: testFunction,
        schema,
        name: 'test',
      });

      expect(runnableFunction.function.description).toBe('');
    });
  });

  describe('parse function', () => {
    it('should parse valid JSON input', () => {
      const schema = z.object({
        name: z.string(),
        count: z.number(),
      });

      const testFunction = async (args: { name: string; count: number }) => {
        return { result: args.name };
      };

      const runnableFunction = zodFunction({
        function: testFunction,
        schema,
      });

      const input = '{"name": "test", "count": 42}';
      const parsed = runnableFunction.function.parse(input);

      expect(parsed).toEqual({ name: 'test', count: 42 });
    });

    it('should throw error on invalid JSON', () => {
      const schema = z.object({
        name: z.string(),
      });

      const testFunction = async (args: { name: string }) => {
        return { result: args.name };
      };

      const runnableFunction = zodFunction({
        function: testFunction,
        schema,
      });

      const invalidInput = 'not a json';

      expect(() => {
        runnableFunction.function.parse(invalidInput);
      }).toThrow();
    });

    it('should validate input against schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const testFunction = async (args: { name: string; age: number }) => {
        return { result: args.name };
      };

      const runnableFunction = zodFunction({
        function: testFunction,
        schema,
      });

      // Valid input
      const validInput = '{"name": "John", "age": 30}';
      expect(() => {
        runnableFunction.function.parse(validInput);
      }).not.toThrow();

      // Invalid input - age is not a number
      const invalidInput = '{"name": "John", "age": "thirty"}';
      expect(() => {
        runnableFunction.function.parse(invalidInput);
      }).toThrow();
    });

    it('should handle complex nested schemas', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        metadata: z.object({
          tags: z.array(z.string()),
        }),
      });

      const testFunction = async (args: {
        user: { name: string; email: string };
        metadata: { tags: string[] };
      }) => {
        return { result: args.user.name };
      };

      const runnableFunction = zodFunction({
        function: testFunction,
        schema,
      });

      const input = JSON.stringify({
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        metadata: {
          tags: ['tag1', 'tag2'],
        },
      });

      const parsed = runnableFunction.function.parse(input);

      expect(parsed.user.name).toBe('John Doe');
      expect(parsed.user.email).toBe('john@example.com');
      expect(parsed.metadata.tags).toEqual(['tag1', 'tag2']);
    });
  });
});
