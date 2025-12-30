/**
 * Private Server Configuration
 * 
 * ⚠️ WARNING: This file contains sensitive configuration that must NEVER be exposed to the client.
 * Only use in server-side code (API routes, server components, middleware).
 * 
 * Centralized configuration loader with validation and type safety.
 * All environment variables are validated at startup to catch missing config early.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string
  apiKey: string
  apiRequestTimeout: number

  // Authentication Configuration
  jwtRefreshThreshold: number
  sessionCookieName: string
  sessionCookieSecure: boolean
  sessionCookieHttpOnly: boolean
  sessionCookieSameSite: 'strict' | 'lax' | 'none'
  sessionExpiryMs: number

  // Session Storage
  sessionStorage: 'memory' | 'redis' | 'database'
  redisUrl?: string
  databaseUrl?: string

  // Feature Flags
  enableEmailVerification: boolean
  enablePasswordReset: boolean

  // Email Configuration
  transactionEmailProvider: 'mock' | 'resend'
  transactionAuthEmailFromAddress: string
  transactionEmailFromName: string
  transactionBaseEmailUrl: string
  resendApiKey?: string
  verificationTokenExpiryHours: number

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  debugMode: boolean

  // Node Environment
  nodeEnv: 'development' | 'production' | 'test'
}

// ============================================================================
// ENVIRONMENT LOADING & VALIDATION
// ============================================================================

function loadEnvVar(key: string, required: boolean = false, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value || ''
}

function loadEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1' || value === 'yes'
}

function loadEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (value === undefined) return defaultValue
  const num = parseInt(value, 10)
  if (isNaN(num)) {
    throw new Error(`Invalid number for ${key}: ${value}`)
  }
  return num
}

// ============================================================================
// CONFIGURATION OBJECT
// ============================================================================

export const config: EnvironmentConfig = {
  // API Configuration (REQUIRED)
  apiBaseUrl: loadEnvVar('API_BASE_URL', true),
  apiKey: loadEnvVar('API_KEY', true),
  apiRequestTimeout: loadEnvNumber('API_REQUEST_TIMEOUT', 30000),

  // Authentication Configuration
  jwtRefreshThreshold: loadEnvNumber('JWT_REFRESH_THRESHOLD', 300000), // 5 minutes
  sessionCookieName: loadEnvVar('SESSION_COOKIE_NAME', false, 'auth-session'),
  sessionCookieSecure: loadEnvBoolean('SESSION_COOKIE_SECURE', process.env.NODE_ENV === 'production'),
  sessionCookieHttpOnly: loadEnvBoolean('SESSION_COOKIE_HTTP_ONLY', true),
  sessionCookieSameSite: (process.env.SESSION_COOKIE_SAME_SITE as any) || (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
  sessionExpiryMs: loadEnvNumber('SESSION_EXPIRY_MS', 3600000), // 1 hour

  // Session Storage
  sessionStorage: (process.env.SESSION_STORAGE as any) || 'memory',
  redisUrl: process.env.REDIS_URL,
  databaseUrl: process.env.DATABASE_URL,

  // Feature Flags
  enableEmailVerification: loadEnvBoolean('ENABLE_EMAIL_VERIFICATION', true),
  enablePasswordReset: loadEnvBoolean('ENABLE_PASSWORD_RESET', true),

  // Email Configuration
  transactionEmailProvider: (process.env.TRANSACTION_EMAIL_PROVIDER as any) || 'mock',
  transactionAuthEmailFromAddress: loadEnvVar('TRANSACTION_AUTH_EMAIL_FROM_ADDRESS', false, 'noreply@localhost'),
  transactionEmailFromName: loadEnvVar('TRANSACTION_EMAIL_FROM_NAME', false, 'Tenant App'),
  transactionBaseEmailUrl: loadEnvVar('TRANSACTION_BASE_EMAIL_URL', false, 'http://localhost:4000'),
  resendApiKey: process.env.RESEND_API_KEY,
  verificationTokenExpiryHours: loadEnvNumber('VERIFICATION_TOKEN_EXPIRY_HOURS', 24),

  // Logging
  logLevel: (process.env.LOG_LEVEL as any) || 'info',
  debugMode: loadEnvBoolean('DEBUG_MODE', false),

  // Node Environment
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate all required environment variables
 * Should be called at application startup
 */
export function validateConfig(): void {
  const errors: string[] = []

  // Validate storage configuration
  if (config.sessionStorage === 'redis' && !config.redisUrl) {
    errors.push('SESSION_STORAGE is "redis" but REDIS_URL is not configured')
  }

  if (config.sessionStorage === 'database' && !config.databaseUrl) {
    errors.push('SESSION_STORAGE is "database" but DATABASE_URL is not configured')
  }

  // Validate email configuration
  if (config.transactionEmailProvider === 'resend' && !config.resendApiKey) {
    errors.push('TRANSACTION_EMAIL_PROVIDER is "resend" but RESEND_API_KEY is not configured')
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }

  // Log configuration on startup (non-sensitive values)
  if (config.debugMode) {
    console.log('✓ Environment configuration loaded successfully')
    console.log(`  - API: ${config.apiBaseUrl}`)
    console.log(`  - Session Storage: ${config.sessionStorage}`)
    console.log(`  - Session Expiry: ${config.sessionExpiryMs}ms`)
    console.log(`  - Email Verification: ${config.enableEmailVerification}`)
    console.log(`  - Password Reset: ${config.enablePasswordReset}`)
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default config
