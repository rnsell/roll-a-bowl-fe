/**
 * Tenant Validation on Startup
 * 
 * Validates that the app can exchange the API key for a Bearer token
 * and can communicate with the backend to fetch tenant information.
 * This is critical for the app to function properly.
 * 
 * Runs server-side only - never exposed to the client.
 */

import api from '@/lib/backend/generated/api-client'
import { apiClient } from '@/lib/config/api-client'
import { createLogger } from '@/lib/config/logging'

const logger = createLogger('TenantValidation')

export interface TenantValidationResult {
  success: boolean
  tenantId?: number
  tenantName?: string
  tenantSlug?: string
  error?: string
}

/**
 * Validate tenant on startup:
 * 1. Exchange API key for Bearer token
 * 2. Fetch tenant information to verify token works
 * 3. Log results
 */
export async function validateTenantOnStartup(): Promise<TenantValidationResult> {

  // Add a timeout to prevent hanging indefinitely
  let timeoutId: NodeJS.Timeout | undefined

  const validationPromise = performValidation().finally(() => {
    // Clear the timeout if validation completes (success or failure)
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  const timeoutPromise = new Promise<TenantValidationResult>((resolve) => {
    timeoutId = setTimeout(
      () => {
        logger.warn({}, 'Tenant validation timed out after 3 seconds')
        resolve({
          success: false,
          error: 'Tenant validation timed out. Backend API may not be responding.',
        })
      },
      3*1000 // 3 second timeout
    )
  })

  return Promise.race([validationPromise, timeoutPromise])
}

async function performValidation(): Promise<TenantValidationResult> {
  try {
    logger.info({}, 'Starting tenant validation...')

    // Step 1: Check if backend API is healthy
    logger.debug({}, 'Checking backend API health endpoint')
    try {
      const healthResponse = await fetch(`${apiClient.baseUrl}/health`)
      if (!healthResponse.ok) {
        const message = `Health check failed with status ${healthResponse.status}`
        logger.error({}, message)
        return {
          success: false,
          error: message,
        }
      }
      logger.info({}, '✅ Backend API health check passed')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Health check failed'
      logger.error({ error: message }, 'Backend API health check failed')
      return {
        success: false,
        error: `Backend API unreachable: ${message}`,
      }
    }

    // Step 2: Fetch tenant information (will trigger Bearer token exchange via request interceptor)
    logger.debug({}, 'Fetching tenant information')
    let response: any
    try {
      const apiResponse = await api.infoControllerGetTenantInfo()
      response = apiResponse.data
      const tenantInfo = response.tenant || response
      logger.info(
        { tenantId: tenantInfo.id, tenantName: tenantInfo.name },
        'Tenant information retrieved successfully'
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logger.error({ error: message }, 'Failed to fetch tenant information')
      return {
        success: false,
        error: `Tenant info fetch failed: ${message}`,
      }
    }

    // Validate tenant info structure
    const tenantInfo = response.tenant || response
    if (!tenantInfo.id || !tenantInfo.name) {
      const error = 'Invalid tenant information: missing id or name'
      logger.error({}, error)
      return {
        success: false,
        error,
      }
    }

    logger.info(
      {
        tenantId: tenantInfo.id,
        tenantName: tenantInfo.name,
        tenantSlug: tenantInfo.slug,
      },
      'Tenant validation completed successfully'
    )

    return {
      success: true,
      tenantId: tenantInfo.id,
      tenantName: tenantInfo.name,
      tenantSlug: tenantInfo.slug,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ error }, 'Unexpected error during tenant validation')
    return {
      success: false,
      error: `Unexpected error: ${message}`,
    }
  }
}
