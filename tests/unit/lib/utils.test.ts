import { describe, it, expect } from '@jest/globals';
import {
  cn,
  generateShortUUID,
  calculateCosineSimilarity,
  formatDate,
  getHomeDirectory,
} from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'conditional', 'always');
      expect(result).toContain('base');
      expect(result).toContain('always');
      expect(result).not.toContain('conditional');
    });
  });

  describe('generateShortUUID', () => {
    it('should generate a 4-character string', () => {
      const uuid = generateShortUUID();
      expect(uuid).toHaveLength(4);
    });

    it('should only contain alphanumeric characters', () => {
      const uuid = generateShortUUID();
      expect(uuid).toMatch(/^[A-Za-z0-9]{4}$/);
    });

    it('should generate different UUIDs on multiple calls', () => {
      const uuid1 = generateShortUUID();
      const uuid2 = generateShortUUID();
      const uuid3 = generateShortUUID();
      
      // With a 4-character alphanumeric UUID (62^4 possibilities),
      // it's extremely unlikely (but not impossible) to get duplicates
      const allDifferent = uuid1 !== uuid2 || uuid2 !== uuid3 || uuid1 !== uuid3;
      expect(allDifferent).toBe(true);
    });
  });

  describe('calculateCosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [1, 2, 3];
      const similarity = calculateCosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(1, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vectorA = [1, 0, 0];
      const vectorB = [0, 1, 0];
      const similarity = calculateCosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(0, 5);
    });

    it('should return -1 for opposite vectors', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [-1, -2, -3];
      const similarity = calculateCosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(-1, 5);
    });

    it('should calculate correct similarity for different vectors', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [4, 5, 6];
      const similarity = calculateCosineSimilarity(vectorA, vectorB);
      // Expected cosine similarity: (1*4 + 2*5 + 3*6) / (sqrt(14) * sqrt(77))
      // = 32 / (3.742 * 8.775) = 32 / 32.84 ≈ 0.974
      expect(similarity).toBeGreaterThan(0.97);
      expect(similarity).toBeLessThan(0.98);
    });

    it('should handle empty vectors', () => {
      const vectorA: number[] = [];
      const vectorB: number[] = [];
      const similarity = calculateCosineSimilarity(vectorA, vectorB);
      // NaN is expected for empty vectors
      expect(isNaN(similarity)).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string correctly', () => {
      const dateString = '2023-01-01T00:00:00.000Z';
      const formatted = formatDate(dateString);
      expect(formatted).toMatch(/Jan 1, 2023/);
    });

    it('should format Date object correctly', () => {
      const date = new Date('2023-06-15T12:30:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jun 15, 2023/);
    });

    it('should include time in the formatted output', () => {
      const dateString = '2023-01-01T14:30:00.000Z';
      const formatted = formatDate(dateString);
      // Should include time component
      expect(formatted).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
    });
  });

  describe('getHomeDirectory', () => {
    it('should return a non-empty string', () => {
      const homeDir = getHomeDirectory();
      expect(homeDir).toBeTruthy();
      expect(typeof homeDir).toBe('string');
      expect(homeDir.length).toBeGreaterThan(0);
    });

    it('should return an absolute path', () => {
      const homeDir = getHomeDirectory();
      // Home directory should start with / on Unix-like systems or contain : on Windows
      const isAbsolute = homeDir.startsWith('/') || homeDir.includes(':');
      expect(isAbsolute).toBe(true);
    });
  });
});
