import { describe, it, expect } from '@jest/globals';
import { isJsonParsable } from '@/lib/jsonHelpers';

describe('JSON Helpers', () => {
  describe('isJsonParsable', () => {
    it('should return parsed object for valid JSON string', () => {
      const validJson = '{"key": "value"}';
      const result = isJsonParsable(validJson);
      expect(result).toEqual({ key: 'value' });
    });

    it('should return parsed array for valid JSON array', () => {
      const validJsonArray = '[1, 2, 3]';
      const result = isJsonParsable(validJsonArray);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return parsed value for valid JSON primitives', () => {
      expect(isJsonParsable('true')).toBe(true);
      expect(isJsonParsable('false')).toBe(false);
      expect(isJsonParsable('null')).toBe(null);
      expect(isJsonParsable('123')).toBe(123);
      expect(isJsonParsable('"string"')).toBe('string');
    });

    it('should return false for invalid JSON', () => {
      const invalidJson = '{key: value}'; // Missing quotes
      const result = isJsonParsable(invalidJson);
      expect(result).toBe(false);
    });

    it('should return false for malformed JSON', () => {
      const malformedJson = '{"key": "value"'; // Missing closing brace
      const result = isJsonParsable(malformedJson);
      expect(result).toBe(false);
    });

    it('should return false for plain strings', () => {
      const plainString = 'not a json';
      const result = isJsonParsable(plainString);
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const emptyString = '';
      const result = isJsonParsable(emptyString);
      expect(result).toBe(false);
    });

    it('should handle nested JSON objects', () => {
      const nestedJson = '{"outer": {"inner": "value"}}';
      const result = isJsonParsable(nestedJson);
      expect(result).toEqual({ outer: { inner: 'value' } });
    });
  });
});
