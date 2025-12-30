/**
 * Public Client Configuration
 * 
 * Only exposes values that are safe to bundle in client-side code.
 * Uses NEXT_PUBLIC_ prefixed environment variables.
 * 
 * ⚠️ WARNING: All values in this file are bundled into the client JavaScript.
 * Never include sensitive values like API keys, secrets, or internal URLs.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ClientConfig {
  // Public API Configuration (if needed)
  feApiBaseURL: string | undefined
  
  // Public App Configuration
  appName: string
  
  // Environment
  nodeEnv: 'development' | 'production' | 'test'
  debugMode: boolean
}

// ============================================================================
// CONFIGURATION LOADING
// ============================================================================

function loadPublicEnvVar(key: string, defaultValue?: string): string | undefined {
  // Only access NEXT_PUBLIC_ prefixed variables
  const value = process.env[`NEXT_PUBLIC_${key}`] || process.env[key]
  return value || defaultValue
}

function loadPublicEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[`NEXT_PUBLIC_${key}`] || process.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1' || value === 'yes'
}

// ============================================================================
// CLIENT CONFIGURATION OBJECT
// ============================================================================

export const clientConfig: ClientConfig = {
  // Public API Configuration
  feApiBaseURL: loadPublicEnvVar('FE_API_BASE_URL'),
  
  // Public App Configuration
  appName: loadPublicEnvVar('APP_NAME', 'Roll a Bowl') || 'Roll a Bowl',
  
  // Environment
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  debugMode: loadPublicEnvBoolean('DEBUG_MODE', false),
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate client configuration
 * Should be called at application startup
 */
export function validateClientConfig(): void {
  const errors: string[] = []
  
  // Add validation rules for public config if needed
  // (e.g., ensure required public URLs are set)
  
  if (errors.length > 0) {
    throw new Error(`Client configuration validation failed:\n${errors.join('\n')}`)
  }
}

export default clientConfig

