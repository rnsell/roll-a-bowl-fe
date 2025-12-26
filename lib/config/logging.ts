/**
 * Logging Configuration with Pino
 * 
 * Provides type-safe logging configuration using Pino logger.
 * Includes pretty-printing in development mode.
 */

import pino, { Logger } from 'pino'
import { config } from './env'

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
 * Create a scoped logger
 */
export function createLogger(scope: string): Logger {
  return rootLogger.child({ scope })
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
