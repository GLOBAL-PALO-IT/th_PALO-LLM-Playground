import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  validateEnvVar,
  validateEnv,
  validateEnvOrThrow,
  formatValidationResult,
  EnvValidationResult,
} from '@/lib/validateEnv';

describe('validateEnv', () => {
  describe('validateEnvVar', () => {
    it('should return true for valid environment variable', () => {
      expect(validateEnvVar('TEST_KEY', 'valid_value')).toBe(true);
    });

    it('should return true for valid OpenAI API key format', () => {
      expect(validateEnvVar('OPENAI_API_KEY', 'sk-proj-1234567890abcdef')).toBe(true);
    });

    it('should return false for undefined value', () => {
      expect(validateEnvVar('TEST_KEY', undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateEnvVar('TEST_KEY', '')).toBe(false);
    });

    it('should return false for whitespace-only string', () => {
      expect(validateEnvVar('TEST_KEY', '   ')).toBe(false);
    });

    it('should return false for placeholder value "<>"', () => {
      expect(validateEnvVar('TEST_KEY', '<>')).toBe(false);
    });

    it('should return false for placeholder value "your_key_here"', () => {
      expect(validateEnvVar('TEST_KEY', 'your_key_here')).toBe(false);
    });

    it('should return false for placeholder value "your_api_key_here"', () => {
      expect(validateEnvVar('TEST_KEY', 'your_api_key_here')).toBe(false);
    });

    it('should return false for placeholder value "sk-your-api-key-here"', () => {
      expect(validateEnvVar('TEST_KEY', 'sk-your-api-key-here')).toBe(false);
    });

    it('should return false for value containing placeholder', () => {
      expect(validateEnvVar('TEST_KEY', 'prefix_<>_suffix')).toBe(false);
    });
  });

  describe('validateEnv', () => {
    it('should validate successfully with all required env vars set', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
      };

      const result = validateEnv(env);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error when OPENAI_API_KEY is missing', () => {
      const env = {};

      const result = validateEnv(env);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('OPENAI_API_KEY');
      expect(result.errors[0]).toContain('https://platform.openai.com/api-keys');
    });

    it('should return error when OPENAI_API_KEY is empty', () => {
      const env = {
        OPENAI_API_KEY: '',
      };

      const result = validateEnv(env);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('OPENAI_API_KEY');
    });

    it('should return error when OPENAI_API_KEY is a placeholder', () => {
      const env = {
        OPENAI_API_KEY: '<>',
      };

      const result = validateEnv(env);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should include warnings for missing optional variables', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
      };

      const result = validateEnv(env);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      
      // Check for specific optional env vars
      const tavilyWarning = result.warnings.find(w => w.includes('TAVILY_API_KEY'));
      expect(tavilyWarning).toBeDefined();
      expect(tavilyWarning).toContain('ReAct search agent');
    });

    it('should not warn about optional variables that are set', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
        TAVILY_API_KEY: 'tvly-test1234567890',
      };

      const result = validateEnv(env);

      expect(result.isValid).toBe(true);
      
      // TAVILY_API_KEY should not be in warnings
      const tavilyWarning = result.warnings.find(w => w.includes('TAVILY_API_KEY'));
      expect(tavilyWarning).toBeUndefined();
    });

    it('should provide context for Neo4j environment variables', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
      };

      const result = validateEnv(env);

      const neo4jWarning = result.warnings.find(w => w.includes('NEO4J_'));
      expect(neo4jWarning).toBeDefined();
      expect(neo4jWarning).toContain('graph database');
    });

    it('should provide context for Langfuse environment variables', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
      };

      const result = validateEnv(env);

      const langfuseWarning = result.warnings.find(w => w.includes('LANGFUSE_'));
      expect(langfuseWarning).toBeDefined();
      expect(langfuseWarning).toContain('observability');
    });

    it('should provide context for LiveKit environment variables', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
      };

      const result = validateEnv(env);

      const livekitWarning = result.warnings.find(w => w.includes('LIVEKIT_'));
      expect(livekitWarning).toBeDefined();
      expect(livekitWarning).toContain('voice/phone call');
    });

    it('should handle all environment variables set correctly', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
        TAVILY_API_KEY: 'tvly-test1234567890',
        SERPER_API_KEY: 'serper-test1234567890',
        NEO4J_URI: 'neo4j://localhost:7687',
        NEO4J_USER: 'neo4j',
        NEO4J_PASSWORD: 'password',
        LANGFUSE_SECRET_KEY: 'sk-lf-test',
        LANGFUSE_PUBLIC_KEY: 'pk-lf-test',
        LANGFUSE_HOST: 'https://cloud.langfuse.com',
        LIVEKIT_API_KEY: 'lk-api-key',
        LIVEKIT_API_SECRET: 'lk-api-secret',
        LIVEKIT_URL: 'wss://test.livekit.cloud',
        TWILIO_SERVER: 'https://twilio-server.com',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      };

      const result = validateEnv(env);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should use process.env by default when no env parameter is provided', () => {
      // This test verifies that validateEnv() without parameters doesn't throw
      // We can't reliably test the actual process.env in the test environment
      const result = validateEnv();
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });
  });

  describe('validateEnvOrThrow', () => {
    it('should not throw when all required env vars are set', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
      };

      expect(() => validateEnvOrThrow(env)).not.toThrow();
    });

    it('should throw error when required env var is missing', () => {
      const env = {};

      expect(() => validateEnvOrThrow(env)).toThrow();
      expect(() => validateEnvOrThrow(env)).toThrow('Environment validation failed');
      expect(() => validateEnvOrThrow(env)).toThrow('OPENAI_API_KEY');
    });

    it('should include helpful error message with instructions', () => {
      const env = {};

      try {
        validateEnvOrThrow(env);
        fail('Should have thrown an error');
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain('.env.example');
        expect(message).toContain('cp .env.example .env');
        expect(message).toContain('GETTING_STARTED.md');
      }
    });

    it('should not throw but log warnings for optional env vars', () => {
      const env = {
        OPENAI_API_KEY: 'sk-test1234567890',
      };

      // Mock console.warn to capture warnings
      const originalWarn = console.warn;
      const warnings: string[] = [];
      console.warn = (...args: unknown[]) => {
        warnings.push(args.join(' '));
      };

      try {
        validateEnvOrThrow(env);
        
        // Should have logged warnings for optional env vars
        expect(warnings.length).toBeGreaterThan(0);
        expect(warnings.some(w => w.includes('Optional environment variables'))).toBe(true);
      } finally {
        console.warn = originalWarn;
      }
    });
  });

  describe('formatValidationResult', () => {
    it('should format validation result with errors', () => {
      const result: EnvValidationResult = {
        isValid: false,
        errors: ['OPENAI_API_KEY is required but not set.'],
        warnings: [],
      };

      const formatted = formatValidationResult(result);

      expect(formatted).toContain('❌ Errors:');
      expect(formatted).toContain('OPENAI_API_KEY');
    });

    it('should format validation result with warnings', () => {
      const result: EnvValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['TAVILY_API_KEY is not set (optional).'],
      };

      const formatted = formatValidationResult(result);

      expect(formatted).toContain('⚠️  Warnings:');
      expect(formatted).toContain('TAVILY_API_KEY');
    });

    it('should format validation result with both errors and warnings', () => {
      const result: EnvValidationResult = {
        isValid: false,
        errors: ['OPENAI_API_KEY is required but not set.'],
        warnings: ['TAVILY_API_KEY is not set (optional).'],
      };

      const formatted = formatValidationResult(result);

      expect(formatted).toContain('❌ Errors:');
      expect(formatted).toContain('OPENAI_API_KEY');
      expect(formatted).toContain('⚠️  Warnings:');
      expect(formatted).toContain('TAVILY_API_KEY');
    });

    it('should format success message when all variables are set', () => {
      const result: EnvValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      const formatted = formatValidationResult(result);

      expect(formatted).toContain('✅');
      expect(formatted).toContain('All environment variables are properly configured');
    });

    it('should separate errors and warnings with blank line', () => {
      const result: EnvValidationResult = {
        isValid: false,
        errors: ['Error 1'],
        warnings: ['Warning 1'],
      };

      const formatted = formatValidationResult(result);
      const lines = formatted.split('\n');

      const errorIndex = lines.findIndex(l => l.includes('❌ Errors:'));
      const warningIndex = lines.findIndex(l => l.includes('⚠️  Warnings:'));

      // There should be a blank line between errors and warnings
      expect(lines[errorIndex + 2]).toBe('');
      expect(warningIndex).toBe(errorIndex + 3);
    });
  });
});
