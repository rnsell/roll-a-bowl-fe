/**
 * Backend API Clients
 *
 * Centralized exports for all backend API client implementations.
 */

// API Token Manager
export { ApiTokenManager } from './api-token-manager'
export type { TokenExchangeResponse } from './api-token-manager'

// Axios Client Factory
export { createAuthenticatedAxiosClient } from './create-axios-client'
export type { AuthenticatedAxiosClient, AxiosClientConfig } from './create-axios-client'

// Auto-generated API Client (primary interface)
export { default as api, tokenManager } from './generated/api-client'

// Auth Client (high-level auth methods)
export { AuthClient, authClient } from './auth-client'
export type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './auth-client'

// Re-export generated types for convenience
export type {
  UserLoginDto,
  UserLoginResponseDto,
  UserRegisterDto,
  UserRegisterResponseDto,
  EmailVerificationDto,
  EmailVerificationResponseDto,
  PasswordResetDto,
  PasswordResetResponseDto,
  PasswordResetRequestDto,
  PasswordResetRequestResponseDto,
  ExchangeTokenDto,
  ExchangeTokenResponseDto,
  RevokeTokenDto,
  RevokeTokenResponseDto,
  TenantInfoResponseDto,
} from './generated/data-contracts'

// GraphQL Client
export { GraphQLClient, graphqlClient, buildQuery, buildMutation } from './graphql-client'
export type { GraphQLError, GraphQLResponse, GraphQLRequest } from './graphql-client'
export {
  GET_PLACES,
  GET_PLACE,
  GET_TENANT,
  GET_AUDIT_LOGS,
} from './graphql-client'
