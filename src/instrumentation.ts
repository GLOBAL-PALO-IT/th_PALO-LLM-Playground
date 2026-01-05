/**
 * Next.js Instrumentation
 * 
 * This file is automatically called when Next.js initializes, both on server and edge runtime.
 * It's the perfect place to validate environment variables before the app starts.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";

export async function register() {
  // Initialize LangFuse SDK
  const sdk = new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()],
  });
  sdk.start();

  // Only run validation on the server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvOrThrow } = await import('@/lib/validateEnv');
    
    try {
      validateEnvOrThrow();
      console.log('✅ Environment variables validated successfully');
    } catch (error) {
      console.error('\n' + (error as Error).message);
      // Allow the app to continue in development for better DX
      // but exit in production
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
}
