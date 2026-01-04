# Environment Validation

This module provides environment variable validation with helpful error messages and guidance.

## Features

- ✅ Validates required environment variables (e.g., `OPENAI_API_KEY`)
- ⚠️ Warns about missing optional environment variables
- 🔗 Provides URLs where to get API keys
- 📝 Gives context about what each variable is used for
- 🎯 Clear, actionable error messages

## Usage

### Basic Validation

```typescript
import { validateEnv, validateEnvOrThrow } from '@/lib/validateEnv';

// Option 1: Get validation result
const result = validateEnv();

if (!result.isValid) {
  console.error('Environment validation failed:');
  result.errors.forEach(error => console.error(error));
}

if (result.warnings.length > 0) {
  console.warn('Optional environment variables:');
  result.warnings.forEach(warning => console.warn(warning));
}

// Option 2: Throw error if validation fails
try {
  validateEnvOrThrow();
  console.log('✅ Environment is properly configured');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
```

### Validate Custom Environment

```typescript
import { validateEnv } from '@/lib/validateEnv';

// Validate a custom environment object
const customEnv = {
  OPENAI_API_KEY: 'sk-test123',
  TAVILY_API_KEY: 'tvly-test123',
};

const result = validateEnv(customEnv);
console.log(result.isValid); // true
```

### Format Validation Results

```typescript
import { validateEnv, formatValidationResult } from '@/lib/validateEnv';

const result = validateEnv();
const formatted = formatValidationResult(result);

console.log(formatted);
// Output:
// ✅ All environment variables are properly configured!
// or
// ❌ Errors:
//   - OPENAI_API_KEY is required but not set. Get your API key from: https://platform.openai.com/api-keys
// 
// ⚠️  Warnings:
//   - TAVILY_API_KEY is not set (optional). Get it from: https://tavily.com Required for ReAct search agent feature.
```

### Validate Individual Variables

```typescript
import { validateEnvVar } from '@/lib/validateEnv';

const isValid = validateEnvVar('OPENAI_API_KEY', process.env.OPENAI_API_KEY);

if (!isValid) {
  console.error('OPENAI_API_KEY is not properly configured');
}
```

## Integration Examples

### Next.js Middleware

```typescript
// src/middleware.ts
import { validateEnvOrThrow } from '@/lib/validateEnv';

// Validate environment on server startup
if (process.env.NODE_ENV === 'production') {
  validateEnvOrThrow();
}
```

### API Route

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';
import { validateEnv } from '@/lib/validateEnv';

export async function GET() {
  const envCheck = validateEnv();
  
  if (!envCheck.isValid) {
    return NextResponse.json(
      { error: 'Server configuration error', details: envCheck.errors },
      { status: 500 }
    );
  }
  
  // Your API logic here
}
```

### Startup Script

```typescript
// scripts/validate-env.ts
import { validateEnvOrThrow, formatValidationResult, validateEnv } from '@/lib/validateEnv';

console.log('🔍 Validating environment variables...\n');

try {
  const result = validateEnv();
  console.log(formatValidationResult(result));
  
  if (!result.isValid) {
    process.exit(1);
  }
  
  console.log('\n✨ Environment validation successful!');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
```

## Required Environment Variables

- `OPENAI_API_KEY` - Required for all AI/LLM features
  - Get from: https://platform.openai.com/api-keys

## Optional Environment Variables

### Search & Web
- `TAVILY_API_KEY` - For ReAct search agent features
  - Get from: https://tavily.com
- `SERPER_API_KEY` - For Serper search features

### Graph Database
- `NEO4J_URI` - Neo4j database connection URI
- `NEO4J_USER` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password

### Observability
- `LANGFUSE_SECRET_KEY` - LLM observability
- `LANGFUSE_PUBLIC_KEY` - LLM observability
- `LANGFUSE_HOST` - Langfuse host URL
  - Get from: https://langfuse.com

### Voice/Phone
- `LIVEKIT_API_KEY` - For voice call features
- `LIVEKIT_API_SECRET` - For voice call features
- `LIVEKIT_URL` - LiveKit server URL
- `TWILIO_SERVER` - Twilio server for phone calls

### Other
- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_API_URL` - Public API URL

## Testing

The validation module includes comprehensive unit tests:

```bash
# Run validation tests
npm test -- validateEnv.test.ts

# Run with coverage
npm run test:coverage
```

## API Reference

### `validateEnvVar(key: string, value: string | undefined): boolean`

Validates a single environment variable.

**Parameters:**
- `key` - Environment variable name
- `value` - Environment variable value

**Returns:** `true` if valid, `false` otherwise

### `validateEnv(env?: NodeJS.ProcessEnv): EnvValidationResult`

Validates all environment variables.

**Parameters:**
- `env` - Environment object (defaults to `process.env`)

**Returns:** Object with `isValid`, `errors`, and `warnings` properties

### `validateEnvOrThrow(env?: NodeJS.ProcessEnv): void`

Validates environment variables and throws an error if validation fails.

**Parameters:**
- `env` - Environment object (defaults to `process.env`)

**Throws:** Error if required variables are missing

### `formatValidationResult(result: EnvValidationResult): string`

Formats validation result as a human-readable string.

**Parameters:**
- `result` - Validation result object

**Returns:** Formatted string with errors and warnings

## See Also

- [Getting Started Guide](../../GETTING_STARTED.md)
- [Environment Setup](../../RECOMMENDATIONS.md#environment-setup--documentation)
- [.env.example](../../.env.example)
