/**
 * GraphQL Client for Event Directory Backend
 * 
 * Handles GraphQL queries and mutations with automatic token management.
 * Provides a typed interface for backend data access.
 */

import { getGraphQLUrl } from '@/lib/config/api-client'
import { config } from '@/lib/config/private/config'
import { createLogger } from '@/lib/config/logging'

const logger = createLogger('GraphQLClient')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GraphQLError {
  message: string
  locations?: Array<{ line: number; column: number }>
  path?: Array<string | number>
  extensions?: Record<string, any>
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: GraphQLError[]
}

export interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
}

// ============================================================================
// GRAPHQL CLIENT CLASS
// ============================================================================

export class GraphQLClient {
  private url: string
  private timeout: number
  private getToken: (() => Promise<string | null>) | null = null

  constructor() {
    this.url = getGraphQLUrl()
    this.timeout = config.apiRequestTimeout
  }

  /**
   * Set token getter function (called when making requests)
   * This allows the client to get fresh tokens from session storage
   */
  setTokenGetter(getter: () => Promise<string | null>): void {
    this.getToken = getter
  }

  /**
   * Make a GraphQL request
   */
  async request<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<GraphQLResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      logger.debug({ query: query.substring(0, 100) + '...' }, 'GraphQL Request')

      // Get current token
      let token: string | null = null
      if (this.getToken) {
        token = await this.getToken()
      }

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Make request
      const response = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Parse response
      const data = await response.json()

      // Check for errors
      if (data.errors) {
        logger.warn({ errors: data.errors }, 'GraphQL Errors')
        return {
          data: data.data,
          errors: data.errors,
        }
      }

      if (!response.ok) {
        const error = new Error(`GraphQL Request failed: ${response.status}`)
        logger.error({ status: response.status }, 'Request failed')
        throw error
      }

      logger.debug({}, 'GraphQL Success')
      return {
        data: data.data,
        errors: undefined,
      }
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        logger.error({}, 'GraphQL Request timeout')
        throw new Error('GraphQL request timeout')
      }

      logger.error({ error }, 'GraphQL Request error')
      throw error
    }
  }

  /**
   * Query helper
   */
  async query<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const response = await this.request<T>(query, variables)

    if (response.errors && response.errors.length > 0) {
      const message = response.errors.map((e) => e.message).join(', ')
      throw new Error(`GraphQL Error: ${message}`)
    }

    if (!response.data) {
      throw new Error('No data returned from GraphQL query')
    }

    return response.data
  }

  /**
   * Mutation helper
   */
  async mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>
  ): Promise<T> {
    return this.query<T>(mutation, variables)
  }

  /**
   * Batch multiple queries
   */
  async batch<T extends Record<string, any>>(
    queries: Record<keyof T, { query: string; variables?: Record<string, any> }>
  ): Promise<T> {
    const results: Record<string, any> = {}

    for (const [key, { query, variables }] of Object.entries(queries)) {
      try {
        results[key] = await this.query(query, variables)
      } catch (error) {
        logger.warn({ error }, `Batch query failed for ${key}`)
        results[key] = null
      }
    }

    return results as T
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const graphqlClient = new GraphQLClient()

// ============================================================================
// QUERY/MUTATION BUILDER UTILITIES
// ============================================================================

/**
 * Helper to build GraphQL query strings
 */
export function buildQuery(
  name: string,
  fields: string,
  args?: Record<string, any>
): string {
  const argsStr = args && Object.keys(args).length > 0 ? buildArgs(args) : ''
  return `query ${name}${argsStr} { ${fields} }`
}

/**
 * Helper to build GraphQL mutation strings
 */
export function buildMutation(
  name: string,
  fields: string,
  args?: Record<string, any>
): string {
  const argsStr = args && Object.keys(args).length > 0 ? buildArgs(args) : ''
  return `mutation ${name}${argsStr} { ${fields} }`
}

/**
 * Helper to build GraphQL arguments string
 */
function buildArgs(args: Record<string, any>): string {
  const argStrings = Object.entries(args).map(([key, value]) => {
    if (typeof value === 'string') {
      return `$${key}: String`
    } else if (typeof value === 'number') {
      return `$${key}: Int`
    } else if (typeof value === 'boolean') {
      return `$${key}: Boolean`
    }
    return `$${key}: JSON`
  })

  return `(${argStrings.join(', ')})`
}

// ============================================================================
// COMMON QUERY TEMPLATES
// ============================================================================

/**
 * Get places with pagination
 */
export const GET_PLACES = `
  query GetPlaces($first: Int, $after: String) {
    places(first: $first, after: $after) {
      edges {
        node {
          id
          name
          description
          city
          country
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`

/**
 * Get single place by ID
 */
export const GET_PLACE = `
  query GetPlace($id: ID!) {
    place(id: $id) {
      id
      name
      description
      city
      country
      createdAt
      updatedAt
    }
  }
`

/**
 * Get current tenant info
 */
export const GET_TENANT = `
  query GetTenant {
    tenant {
      id
      name
      slug
      status
      createdAt
    }
  }
`

/**
 * Get audit logs
 */
export const GET_AUDIT_LOGS = `
  query GetAuditLogs($first: Int, $after: String) {
    auditLogs(first: $first, after: $after) {
      edges {
        node {
          id
          action
          entityType
          entityId
          userId
          timestamp
          changes
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`
