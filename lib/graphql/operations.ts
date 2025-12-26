/**
 * GraphQL Operations
 *
 * Define your GraphQL queries and mutations here.
 * GraphQL Code Generator will automatically create typed hooks for these.
 *
 * After adding new operations, run: npm run generate
 */

// Import gql from "@apollo/client" when you add operations

import { gql } from "@apollo/client";

// ============================================================================
// MINIMAL VIABLE QUERY
// ============================================================================

/**
 * Get current authenticated user profile
 * This is the most basic query available on the GraphQL schema
 * Requires valid authentication (Bearer token + User token)
 */
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstName
      lastName
      fullName
      emailVerified
      status
      tenantId
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// Additional Queries (Examples for reference)
// ============================================================================

/**
 * Example: Get a single place by ID
 * export const GET_PLACE = gql`
 *   query GetPlace($id: ID!) {
 *     place(id: $id) {
 *       id
 *       name
 *       slug
 *       description
 *     }
 *   }
 * `;
 */

/**
 * Example: Get all places (paginated)
 * export const GET_PLACES = gql`
 *   query GetPlaces($limit: Int, $offset: Int) {
 *     places(limit: $limit, offset: $offset) {
 *       items {
 *         id
 *         name
 *         slug
 *       }
 *       total
 *       hasMore
 *     }
 *   }
 * `;
 */
