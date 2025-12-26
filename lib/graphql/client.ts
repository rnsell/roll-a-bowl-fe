/**
 * Apollo Client Configuration
 * 
 * Configured to use the Next.js GraphQL proxy endpoint (/api/graphql)
 * which handles authentication and forwards requests to the backend.
 * 
 * Session cookie is automatically sent by the browser.
 */

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { createLogger } from '@/lib/config/logging'
import { map, catchError } from 'rxjs'
import { throwError } from 'rxjs'

const logger = createLogger('ApolloClient')

// ============================================================================
// HTTP LINK (connects to our GraphQL proxy)
// ============================================================================

const httpLink = new HttpLink({
  uri: '/api/graphql', // ← Our Next.js proxy endpoint
  credentials: 'include', // ✅ Send cookies with each request
  fetch,
})

// ============================================================================
// LOGGING LINK (for debugging)
// ============================================================================

const loggingLink = new ApolloLink((operation, forward) => {
  logger.debug({
    operationName: operation.operationName,
    query: operation.query.loc?.source.body.substring(0, 100),
  }, 'GraphQL Request')

  return forward(operation).pipe(
    map((response) => {
      logger.debug({
        operationName: operation.operationName,
        hasErrors: !!response.errors,
        errorCount: response.errors?.length || 0,
      }, 'GraphQL Response')

      if (response.errors) {
        logger.warn({
          errors: response.errors.map((e) => e.message),
        }, 'GraphQL Errors')
      }

      return response
    })
  )
})

// ============================================================================
// ERROR LINK (for error handling)
// ============================================================================

const errorLink = new ApolloLink((operation, forward) => {
  return forward(operation).pipe(
    catchError((error) => {
      if (error.networkError) {
        logger.error({ error: error.networkError }, 'Network Error')

        // Handle 401 Unauthorized - redirect to login
        if ('status' in error.networkError && error.networkError.status === 401) {
          logger.warn({}, 'Unauthorized - redirecting to login')
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
      }

      if (error.graphQLErrors) {
        logger.error({ errors: error.graphQLErrors }, 'GraphQL Errors')
      }

      return throwError(() => error)
    })
  )
})

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Add cache policies here as needed
      },
    },
  },
})

// ============================================================================
// APOLLO CLIENT INSTANCE
// ============================================================================

export const apolloClient = new ApolloClient({
  ssrMode: typeof window === 'undefined', // Enable SSR mode on server
  link: ApolloLink.from([errorLink, loggingLink, httpLink]),
  cache,
})

export default apolloClient
