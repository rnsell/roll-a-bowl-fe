/**
 * Storage Configuration
 * 
 * Provides type-safe configuration for session storage backends.
 */

import { config } from './env'

export type StorageType = 'memory' | 'redis' | 'database'

export interface StorageConfig {
  type: StorageType
  redisUrl?: string
  databaseUrl?: string
}

/**
 * Storage configuration object
 */
export const storageConfig: StorageConfig = {
  type: config.sessionStorage,
  redisUrl: config.redisUrl,
  databaseUrl: config.databaseUrl,
}

/**
 * Check if Redis storage is configured
 */
export function isRedisStorageEnabled(): boolean {
  return storageConfig.type === 'redis' && !!storageConfig.redisUrl
}

/**
 * Check if database storage is configured
 */
export function isDatabaseStorageEnabled(): boolean {
  return storageConfig.type === 'database' && !!storageConfig.databaseUrl
}

/**
 * Check if in-memory storage is used
 */
export function isMemoryStorageEnabled(): boolean {
  return storageConfig.type === 'memory'
}

/**
 * Get storage backend details for debugging
 */
export function getStorageDebugInfo(): Record<string, any> {
  return {
    type: storageConfig.type,
    redis: isRedisStorageEnabled() ? '✓ configured' : '✗ not configured',
    database: isDatabaseStorageEnabled() ? '✓ configured' : '✗ not configured',
    memory: isMemoryStorageEnabled() ? '✓ enabled' : '✗ not enabled',
  }
}
