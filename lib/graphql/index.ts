/**
 * GraphQL Module Exports
 *
 * Central export point for all GraphQL-related utilities, client, and operations.
 */

// Client configuration
export { apolloClient, default } from "./client";
export { ApolloWrapper } from "./provider";

// Operations (queries and mutations)
// Add and export your operations here as they're defined in operations.ts
// export { GET_USERS, CREATE_USER } from './operations'

// Generated types and hooks (once codegen is run)
// These will be created by: npm run generate
// export * from './generated/types'
// export * from './generated/hooks'
