/**
 * Express GraphQL Proxy Route
 * 
 * Forwards GraphQL requests to the backend API with proper authentication
 */

import { Router, Request, Response } from 'express'
import { tokenManager } from '@/lib/backend/generated/api-client'
import { apiClient } from '@/lib/config/api-client'
import { sessionManager } from '@/lib/session'
import { createLogger } from '@/lib/config/logging'

const logger = createLogger('GraphQLRoute')
const router = Router()

// ============================================================================
// TYPES
// ============================================================================

interface AuthTokens {
  bearerToken: string
  userToken?: string
  source: 'session' | 'api_key'
}

interface GraphQLRequestBody {
  query: string
  variables?: Record<string, any>
  operationName?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract authentication tokens from request
 */
async function extractAuthTokens(req: Request): Promise<AuthTokens | null> {
  try {
    // Get Bearer token from token manager
    let bearerToken: string
    try {
      bearerToken = await tokenManager.getToken()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logger.error({ error: message }, 'Failed to obtain Bearer token')
      return null
    }

    // Get user token from session if available
    const sessionId = (req as any).sessionId
    let userToken: string | undefined

    if (sessionId) {
      const session = await sessionManager.getSession(sessionId)
      if (session) {
        userToken = session.userToken
      }
    }

    return {
      bearerToken,
      userToken,
      source: sessionId ? 'session' : 'api_key',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ error: message }, 'Failed to extract auth tokens')
    return null
  }
}

/**
 * Extract tenant ID from JWT payload (without verification)
 */
function extractTenantIdFromToken(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload.tenantId || null
  } catch {
    return null
  }
}

/**
 * Validate that user and bearer tokens have matching tenant IDs
 */
function validateTenantConsistency(bearerToken: string, userToken: string): boolean {
  const bearerTenantId = extractTenantIdFromToken(bearerToken)
  const userTenantId = extractTenantIdFromToken(userToken)

  if (!bearerTenantId || !userTenantId) {
    return false
  }

  return bearerTenantId === userTenantId
}

// ============================================================================
// POST /api/graphql
// ============================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    // Extract authentication tokens
    logger.debug({}, 'Extracting authentication tokens')
    const tokens = await extractAuthTokens(req)

    if (!tokens) {
      logger.warn({}, 'Failed to extract authentication tokens')
      return res.status(401).json({
        errors: [
          {
            message: 'Unauthorized - Session required',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
      })
    }

    // Validate tenant consistency if user token present
    if (tokens.userToken && !validateTenantConsistency(tokens.bearerToken, tokens.userToken)) {
      logger.warn({}, 'Tenant ID mismatch between Bearer and User tokens')
      return res.status(401).json({
        errors: [
          {
            message: 'Unauthorized - User tenant ID does not match API token tenant ID',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
      })
    }

    // Parse GraphQL request body
    const body = req.body as GraphQLRequestBody

    if (!body.query) {
      logger.warn({}, 'GraphQL request missing query')
      return res.status(400).json({
        errors: [
          {
            message: 'Query is required',
            extensions: { code: 'BAD_REQUEST' },
          },
        ],
      })
    }

    // Log GraphQL request (first 100 chars of query)
    const queryPreview = body.query.substring(0, 100).replace(/\s+/g, ' ')
    logger.debug({
      query: queryPreview,
      operationName: body.operationName,
      hasVariables: !!body.variables,
      hasUserToken: !!tokens.userToken,
    }, 'GraphQL request')

    // Prepare headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.bearerToken}`,
    }

    // Add user token if present
    if (tokens.userToken) {
      headers['X-User-Token'] = tokens.userToken
    }

    // Forward request to backend GraphQL endpoint
    const backendUrl = `${apiClient.baseUrl}/graphql`

    logger.debug({
      url: backendUrl,
      hasUserToken: !!tokens.userToken,
    }, 'Forwarding to backend')

    const graphqlResponse = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: body.query,
        variables: body.variables,
        operationName: body.operationName,
      }),
    })

    // Parse backend response
    const responseData = await graphqlResponse.json()

    // Check for GraphQL errors
    if (responseData.errors) {
      logger.warn({
        errorCount: responseData.errors.length,
        firstError: responseData.errors[0]?.message,
      }, 'GraphQL errors from backend')

      // Check if it's an authentication error
      const hasAuthError = responseData.errors.some((error: any) =>
        error.message?.toLowerCase().includes('unauthorized') ||
        error.message?.toLowerCase().includes('authentication') ||
        error.extensions?.code === 'UNAUTHENTICATED'
      )

      if (hasAuthError) {
        return res.status(401).json({
          errors: [
            {
              message: 'Authentication failed',
              extensions: { code: 'UNAUTHENTICATED' },
            },
          ],
        })
      }
    }

    // Check for HTTP errors
    if (!graphqlResponse.ok) {
      logger.error({
        status: graphqlResponse.status,
        statusText: graphqlResponse.statusText,
      }, 'Backend GraphQL endpoint error')

      return res.status(graphqlResponse.status).json({
        errors: [
          {
            message: 'Backend error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          },
        ],
      })
    }

    logger.debug({
      hasData: !!responseData.data,
      hasErrors: !!responseData.errors,
    }, 'GraphQL response successful')

    // Return backend response as-is
    return res.status(200).json(responseData)
  } catch (error: any) {
    logger.error({ error }, 'GraphQL proxy error')

    return res.status(500).json({
      errors: [
        {
          message: 'Internal server error',
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        },
      ],
    })
  }
})

export default router




