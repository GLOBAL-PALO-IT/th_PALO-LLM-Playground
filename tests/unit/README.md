# Unit Testing Guide

## Overview

This project uses [Jest](https://jestjs.io/) as the unit testing framework for testing TypeScript/JavaScript code.

## Test Structure

- **Unit Tests**: Located in `tests/unit/`
- **E2E Tests**: Located in `tests/e2e/` (using Playwright)

Unit tests follow the same directory structure as the source code, making it easy to find tests for specific modules.

## Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run unit tests specifically
npm run test:unit
```

## Writing Tests

### Test File Naming

Test files should be placed in `tests/unit/` and follow the naming convention:
- `*.test.ts` or `*.test.tsx` for test files
- `*.spec.ts` or `*.spec.tsx` for specification files

### Example Test Structure

```typescript
import { describe, it, expect } from '@jest/globals';
import { functionToTest } from '@/lib/utils';

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should do something specific', () => {
      const result = functionToTest('input');
      expect(result).toBe('expected output');
    });
  });
});
```

### Path Aliases

The `@/` alias maps to the `src/` directory, so you can import modules like:
```typescript
import { something } from '@/lib/utils';
import { Component } from '@/components/Component';
```

## Configuration

- **Jest Config**: `jest.config.js` - Main Jest configuration
- **TypeScript**: Tests are written in TypeScript using `ts-jest` preset

## Coverage

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Best Practices

1. **Test Organization**: Mirror the source code structure in your test files
2. **Test Isolation**: Each test should be independent and not rely on other tests
3. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
4. **Arrange-Act-Assert**: Structure tests with setup, execution, and assertion phases
5. **Edge Cases**: Test both happy paths and edge cases
6. **Mock External Dependencies**: Mock API calls, database connections, and other external dependencies

## CI/CD Integration

Unit tests can be run as part of your CI/CD pipeline:
```bash
npm test
```

This will run all unit tests and exit with a non-zero code if any tests fail.
