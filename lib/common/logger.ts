/**
 * Universal Logger
 * 
 * Provides a unified logging interface that works on both server and client.
 * 
 * - Server: Uses Pino logger with structured logging
 * - Client: Uses console with formatted output
 * 
 * Automatically detects the environment and uses the appropriate logger.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
  debug: (data: any, message?: string) => void
  info: (data: any, message?: string) => void
  warn: (data: any, message?: string) => void
  error: (data: any, message?: string) => void
}

// ============================================================================
// CLIENT-SIDE LOGGER (Console-based)
// ============================================================================

class ClientLogger implements Logger {
  private scope: string
  private debugMode: boolean

  constructor(scope: string, debugMode: boolean = false) {
    this.scope = scope
    this.debugMode = debugMode
  }

  private formatMessage(level: LogLevel, data: any, message?: string): string {
    const prefix = `[${this.scope}] ${level.toUpperCase()}`
    const dataStr = data && typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)
    return message ? `${prefix}: ${message} ${dataStr ? `\n${dataStr}` : ''}` : `${prefix}: ${dataStr || message || ''}`
  }

  debug(data: any, message?: string): void {
    if (this.debugMode) {
      console.debug(this.formatMessage('debug', data, message))
    }
  }

  info(data: any, message?: string): void {
    console.info(this.formatMessage('info', data, message))
  }

  warn(data: any, message?: string): void {
    console.warn(this.formatMessage('warn', data, message))
  }

  error(data: any, message?: string): void {
    console.error(this.formatMessage('error', data, message))
  }
}

// ============================================================================
// SERVER-SIDE LOGGER (Pino-based)
// ============================================================================

let serverLoggerFactory: ((scope: string) => Logger) | null = null

/**
 * Initialize server logger factory
 * Should be called once during server startup
 */
export function initializeServerLogger(factory: (scope: string) => Logger): void {
  serverLoggerFactory = factory
}

// ============================================================================
// LOGGER FACTORY
// ============================================================================

/**
 * Create a logger instance
 * 
 * Automatically uses:
 * - Pino logger on server (if initialized)
 * - Console logger on client
 * 
 * @param scope - Logger scope/name (e.g., 'ApolloClient', 'AuthClient')
 * @param debugMode - Enable debug logging (client-side only)
 */
export function createLogger(scope: string, debugMode: boolean = false): Logger {
  // Check if we're on the server and server logger is available
  if (typeof window === 'undefined' && serverLoggerFactory) {
    return serverLoggerFactory(scope)
  }

  // Use client-side console logger
  return new ClientLogger(scope, debugMode)
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default createLogger

