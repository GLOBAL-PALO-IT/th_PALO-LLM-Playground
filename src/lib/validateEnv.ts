/**
 * Environment Variable Validation
 * 
 * Validates required and optional environment variables on startup.
 * Provides clear error messages and guidance on where to get API keys.
 */

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EnvConfig {
  required: string[];
  optional: string[];
  urls: Record<string, string>;
}

const ENV_CONFIG: EnvConfig = {
  required: ['OPENAI_API_KEY'],
  optional: [
    'TAVILY_API_KEY',
    'SERPER_API_KEY',
    'NEO4J_URI',
    'NEO4J_USER',
    'NEO4J_PASSWORD',
    'LANGFUSE_SECRET_KEY',
    'LANGFUSE_PUBLIC_KEY',
    'LANGFUSE_HOST',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',
    'LIVEKIT_URL',
    'TWILIO_SERVER',
    'DATABASE_URL',
    'NEXT_PUBLIC_API_URL',
  ],
  urls: {
    OPENAI_API_KEY: 'https://platform.openai.com/api-keys',
    TAVILY_API_KEY: 'https://tavily.com',
    LANGFUSE_SECRET_KEY: 'https://langfuse.com',
    LANGFUSE_PUBLIC_KEY: 'https://langfuse.com',
  },
};

/**
 * Validates a single environment variable
 * @param key - The environment variable name
 * @param value - The environment variable value
 * @returns true if valid, false otherwise
 */
export function validateEnvVar(key: string, value: string | undefined): boolean {
  if (!value) return false;
  
  // Check for placeholder values
  const placeholders = ['<>', 'your_key_here', 'your_api_key_here', 'sk-your-api-key-here'];
  if (placeholders.some(placeholder => value.includes(placeholder))) {
    return false;
  }
  
  // Check for empty or whitespace-only values
  if (value.trim().length === 0) {
    return false;
  }
  
  return true;
}

/**
 * Validates all environment variables
 * @param env - Environment object (defaults to process.env)
 * @returns Validation result with errors and warnings
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required environment variables
  for (const key of ENV_CONFIG.required) {
    const value = env[key];
    
    if (!validateEnvVar(key, value)) {
      const url = ENV_CONFIG.urls[key];
      const errorMsg = url
        ? `${key} is required but not set. Get your API key from: ${url}`
        : `${key} is required but not set.`;
      errors.push(errorMsg);
    }
  }
  
  // Check optional environment variables and provide helpful warnings
  for (const key of ENV_CONFIG.optional) {
    const value = env[key];
    
    if (!validateEnvVar(key, value)) {
      const url = ENV_CONFIG.urls[key];
      let warningMsg = `${key} is not set (optional).`;
      
      if (url) {
        warningMsg += ` Get it from: ${url}`;
      }
      
      // Add feature-specific context
      if (key === 'TAVILY_API_KEY') {
        warningMsg += ' Required for ReAct search agent feature.';
      } else if (key.startsWith('NEO4J_')) {
        warningMsg += ' Required for graph database features.';
      } else if (key.startsWith('LANGFUSE_')) {
        warningMsg += ' Required for LLM observability features.';
      } else if (key.startsWith('LIVEKIT_') || key === 'TWILIO_SERVER') {
        warningMsg += ' Required for voice/phone call features.';
      } else if (key === 'SERPER_API_KEY') {
        warningMsg += ' Required for Serper search features.';
      }
      
      warnings.push(warningMsg);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates environment variables and throws an error if validation fails
 * @param env - Environment object (defaults to process.env)
 * @throws Error if required environment variables are missing
 */
export function validateEnvOrThrow(env: NodeJS.ProcessEnv = process.env): void {
  const result = validateEnv(env);
  
  if (!result.isValid) {
    const errorMessage = [
      '❌ Environment validation failed!',
      '',
      'Missing required environment variables:',
      ...result.errors.map(e => `  - ${e}`),
      '',
      'Please create a .env file in the project root with the required variables.',
      'You can use .env.example as a template:',
      '  cp .env.example .env',
      '',
      'See GETTING_STARTED.md for detailed setup instructions.',
    ].join('\n');
    
    throw new Error(errorMessage);
  }
  
  // Log warnings if any
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set:');
    result.warnings.forEach(w => console.warn(`  - ${w}`));
    console.warn('');
  }
}

/**
 * Formats validation result as a human-readable string
 * @param result - Validation result
 * @returns Formatted string
 */
export function formatValidationResult(result: EnvValidationResult): string {
  const lines: string[] = [];
  
  if (result.errors.length > 0) {
    lines.push('❌ Errors:');
    result.errors.forEach(e => lines.push(`  - ${e}`));
  }
  
  if (result.warnings.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('⚠️  Warnings:');
    result.warnings.forEach(w => lines.push(`  - ${w}`));
  }
  
  if (result.isValid && result.warnings.length === 0) {
    lines.push('✅ All environment variables are properly configured!');
  }
  
  return lines.join('\n');
}
