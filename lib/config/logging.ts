/**
 * Server-Side Logging Configuration with Pino
 * 
 * Provides type-safe logging configuration using Pino logger.
 * Includes pretty-printing in development mode.
 * 
 * ⚠️ This is server-only. For universal logging, use @/lib/common/logger
 */

import pino, { Logger as PinoLogger } from 'pino'
import { config } from './private/config'
import { initializeServerLogger, createLogger as createUniversalLogger, type Logger } from '@/lib/common/logger'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LoggingConfig {
  level: LogLevel
  debug: boolean
  isDevelopment: boolean
}

/**
 * Logging configuration object
 */
export const loggingConfig: LoggingConfig = {
  level: config.logLevel,
  debug: config.debugMode,
  isDevelopment: config.nodeEnv === 'development',
}

/**
 * Create root Pino logger instance
 */
const rootLogger = pino(
  {
    level: loggingConfig.level,
    transport: loggingConfig.isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
            messageFormat: '[{scope}] {levelLabel}: {msg}',
          },
        }
      : undefined,
  }
)

/**
 * Create a scoped Pino logger (server-only)
 * 
 * For universal logging that works on both server and client,
 * use createLogger from @/lib/common/logger instead.
 */
export function createServerLogger(scope: string): PinoLogger {
  return rootLogger.child({ scope })
}

/**
 * Initialize the universal logger with Pino for server-side use
 * This should be called once during server startup
 */
export function initializeLogging(): void {
  initializeServerLogger((scope: string) => {
    const pinoLogger = rootLogger.child({ scope })
    // Convert Pino logger to universal Logger interface
    return {
      debug: (data: any, message?: string) => pinoLogger.debug(data, message),
      info: (data: any, message?: string) => pinoLogger.info(data, message),
      warn: (data: any, message?: string) => pinoLogger.warn(data, message),
      error: (data: any, message?: string) => pinoLogger.error(data, message),
    }
  })
}

/**
 * Create a logger instance (backward compatibility)
 * 
 * On server: Uses Pino logger (after initializeLogging is called)
 * On client: Uses console logger
 * 
 * For new code, prefer importing from @/lib/common/logger directly
 */
export function createLogger(scope: string): Logger {
  return createUniversalLogger(scope, config.debugMode)
}

/**
 * Get logging configuration for debugging
 */
export function getLoggingDebug(): Record<string, any> {
  return {
    level: loggingConfig.level,
    debug: loggingConfig.debug,
    isDevelopment: loggingConfig.isDevelopment,
  }
}
