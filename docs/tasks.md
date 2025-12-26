# Task List - Tenant Frontend BFF Implementation

## Overview

## 🔧 PREREQUISITE: Configuration Abstraction (Start Here)

Before beginning Phase 1, complete these configuration tasks:

### 0.1 Setup Environment Configuration

- **File**: `lib/config/env.ts`
- **Status**: ✅ DONE
- **Description**: Core environment variable loader with validation and type safety

### 0.2 Create API Client Configuration

- **File**: `lib/config/api-client.ts`
- **Status**: ✅ DONE
- **Description**: Centralized API client configuration with URL builders

### 0.3 Create Session Configuration

- **File**: `lib/config/session.ts`
- **Status**: ✅ DONE
- **Description**: Session management configuration with helper functions

### 0.4 Create Storage Configuration

- **File**: `lib/config/storage.ts`
- **Status**: ✅ DONE
- **Description**: Session storage backend configuration and validators

### 0.5 Create Logging Configuration

- **File**: `lib/config/logging.ts`
- **Status**: ✅ DONE
- **Description**: Logging configuration with scoped logger factory

### 0.6 Create Configuration Utilities

- **File**: `lib/config/utils.ts`
- **Status**: ✅ DONE
- **Description**: Helper functions for cookies, configuration getters

### 0.7 Create Configuration Module Index

- **File**: `lib/config/index.ts`
- **Status**: ✅ DONE
- **Description**: Centralized export of all configuration modules

### 0.8 Create .env.example Template

- **File**: `.env.example`
- **Status**: ✅ DONE
- **Description**: Documented environment variables template
  Implementation of Backend for Frontend (BFF) pattern with Next.js wrapping the Event Directory API. All authentication is server-side, frontend consumes Next.js endpoints only.

---

## Phase 1: Server-Side Infrastructure (Core Foundation)

### 1.1 Create REST API Client for Auth Endpoints ✅

- **File**: `lib/backend/rest-client.ts`
- **Responsibility**:
  - Fetch wrapper for Event Directory auth endpoints
  - Error handling and response parsing
  - Support for: login, signup, verify-email, password-reset, token exchange
- **Status**: ✅ Complete
- **Dependencies**: None

### 1.2 Create GraphQL Client Wrapper ✅

- **File**: `lib/backend/graphql-client.ts`
- **Responsibility**:
  - Initialize GraphQL client (Apollo/urql/graphql-request)
  - Handle queries and mutations to backend
  - Manage backend JWT token
  - Error handling for GraphQL errors
- **Status**: ✅ Complete
- **Dependencies**: 1.1

### 1.3 Create Session/Token Management Utilities ✅

- **File**: `lib/session/index.ts`
- **Responsibility**:
  - Server-side token storage (in-memory, Redis, or database)
  - Session creation and validation
  - Token refresh logic (before 1 hour expiry)
  - Session cleanup on logout
  - Session cookie management helpers
- **Status**: ✅ Complete
- **Dependencies**: 1.1, 1.2

### 1.4 Implement Next.js Middleware ✅

- **File**: `middleware.ts`
- **Responsibility**:
  - Validate session cookie on requests
  - Check for protected routes
  - Redirect unauthenticated users to /auth/login
  - Refresh session before expiry
- **Status**: ✅ Complete
- **Dependencies**: 1.3

### 1.5 Create POST /api/auth/login Endpoint ✅

- **File**: `app/api/auth/login/route.ts`
- **Responsibility**:
  - Accept { email, password }
  - Call REST client to authenticate with backend
  - Create server-side session with JWT
  - Set httpOnly session cookie
  - Return user data to frontend
- **Status**: ✅ Complete
- **Dependencies**: 1.1, 1.3

### 1.6 Create POST /api/auth/logout ### 1.6 Create POST /api/auth/logout & GET /api/auth/me Endpoints GET /api/auth/me Endpoints ✅

- **File**: `app/api/auth/logout/route.ts` and `app/api/auth/me/route.ts`
- **Responsibility**:
  - Logout: Delete session, clear cookies
  - Me: Return current authenticated user from session
- **Status**: ✅ Complete
- **Dependencies**: 1.3, 1.5

---

## Phase 2: Authentication API Routes (Extended Auth)

### 2.1 Create POST /api/auth/signup Endpoint ✅

- **File**: `app/api/auth/signup/route.ts`
- **Responsibility**:
  - Accept { email, password, firstName, lastName }
  - Call REST client to register with backend
  - Create server-side session with JWT
  - Set httpOnly session cookie
  - Return user data
- **Status**: ✅ Complete
- **Dependencies**: 1.1, 1.3

### 2.2 Create POST /api/auth/verify-email Endpoint ✅

- **File**: `app/api/auth/verify-email/route.ts`
- **Responsibility**:
  - Accept { token }
  - Call REST client to verify email with backend
  - Return success/error response
- **Status**: ✅ Complete
- **Dependencies**: 1.1

### 2.3 Create POST /api/auth/request-password-reset Endpoint ✅

- **File**: `app/api/auth/request-password-reset/route.ts`
- **Responsibility**:
  - Accept { email }
  - Call REST client to request password reset
  - Return success response (no user info leaking)
- **Status**: ✅ Complete
- **Dependencies**: 1.1

### 2.4 Create POST /api/auth/reset-password Endpoint ✅

- **File**: `app/api/auth/reset-password/route.ts`
- **Responsibility**:
  - Accept { token, newPassword }
  - Call REST client to reset password
  - Return success/error response
- **Status**: ✅ Complete
- **Dependencies**: 1.1

---

## Phase 3: GraphQL Proxy Layer (Data Access)

### 3.1 Create POST /api/graphql Endpoint ✅

- **File**: `app/api/graphql/route.ts`
- **Responsibility**:
  - Accept GraphQL queries and mutations
  - Extract JWT from server-side session
  - Forward request to backend GraphQL with authentication
  - Handle errors and format responses
  - Support Bearer token (tenant-level) and X-User-Token (user-level)
- **Status**: ✅ Complete
- **Dependencies**: 1.3, 1.2

### 3.2 Implement Query/Mutation Forwarding ✅

- **File**: `app/api/graphql/route.ts` (continued)
- **Responsibility**:
  - Add server-side JWT to Authorization header
  - Forward to backend `/graphql` endpoint
  - Handle authentication errors (401, 403)
  - Return GraphQL response to frontend
- **Status**: ✅ Complete
- **Dependencies**: 3.1

### 3.3 Error Handling and Response Formatting ✅

- **File**: `app/api/graphql/route.ts` (continued)
- **Responsibility**:
  - Catch and format GraphQL errors
  - Handle network errors from backend
  - Return proper HTTP status codes
  - Log errors for debugging
- **Status**: ✅ Complete
- **Dependencies**: 3.2

---

## Phase 4: Frontend Integration (Client-Side)

### 4.1 Create useAuth Hook ✅

- **File**: `hooks/useAuth.ts`
- **Responsibility**:
  - Provide current user/tenant context
  - Login function (calls /api/auth/login)
  - Logout function (calls /api/auth/logout)
  - Fetch current user (calls /api/auth/me)
  - Auth loading/error states
  - User data management
- **Status**: ✅ Complete
- **Dependencies**: None (uses Next.js endpoints)

### 4.2 Create useGraphQL Hook ✅

- **File**: `hooks/useGraphQL.ts`
- **Responsibility**:
  - Query wrapper for GraphQL calls
  - Call /api/graphql endpoint
  - Handle loading, error, and data states
  - Automatic session cookie handling
  - Query/mutation helpers
- **Status**: ✅ Complete
- **Dependencies**: None (uses Next.js endpoints)

### 4.3 Build Login Page ✅

- **File**: `app/auth/login/page.tsx`
- **Responsibility**:
  - Email/password form
  - Call useAuth().login()
  - Handle loading and error states
  - Redirect to dashboard on success
  - Show error messages
  - Links to signup and password reset
- **Status**: ✅ Complete
- **Dependencies**: 4.1

### 4.4 Build Signup, Email Verification & Password Reset Pages ✅

- **Files**:
  - `app/auth/signup/page.tsx`
  - `app/auth/verify-email/page.tsx`
  - `app/auth/forgot-password/page.tsx`
  - `app/auth/reset-password/page.tsx`
- **Responsibility**:
  - Signup: Email, password, firstName, lastName form
  - Email verification: Token input and verification
  - Forgot password: Email input to request reset
  - Reset password: Token and new password input
  - All pages handle loading/error states and redirects
- **Status**: ✅ Complete
- **Dependencies**: 4.1

---

## Phase 5: Testing & Polish (Quality Assurance)

### 5.1 Test Complete Auth Flow End-to-End ✅

- **Responsibility**:
  - Test signup → email verification → login → access protected routes
  - Test password reset flow
  - Test logout and session clearing
  - Test token expiry and refresh
  - Verify backend communication
- **Status**: ✅ Complete
- **Dependencies**: All Phase 1-4 tasks

### 5.2 Handle Edge Cases and Error Scenarios ✅

- **Responsibility**:
  - Test with invalid credentials
  - Test with already-registered emails
  - Test with expired tokens
  - Test with account lockout (5 failed attempts)
  - Test with network errors
  - Ensure proper error recovery
- **Status**: ✅ Complete
- **Dependencies**: 5.1

### 5.3 Add Loading States and Error Messages ✅

- **Responsibility**:
  - Add loading spinners to buttons
  - Show clear, user-friendly error messages
  - Display account lockout countdown
  - Show token expiration warnings
  - Smooth loading transitions
- **Status**: ✅ Complete
- **Dependencies**: 5.2

### 5.4 Security Review and Best Practices ✅

- **Responsibility**:
  - Review CORS configuration
  - Verify httpOnly cookie flags
  - Check CSRF protection
  - Verify session cleanup
  - Audit error messages (no info leaking)
  - Review rate limiting on auth endpoints
  - Ensure JWTs never exposed to frontend
- **Status**: ✅ Complete
- **Dependencies**: 5.3

---

## Summary Statistics

| Phase     | Tasks  | Status               |
| --------- | ------ | -------------------- |
| Phase 1   | 6      | ✅✅✅✅✅✅         |
| Phase 2   | 4      | ✅✅✅✅             |
| Phase 3   | 3      | ✅✅✅               |
| Phase 4   | 4      | ✅✅✅✅             |
| Phase 5   | 4      | ✅✅✅✅             |
| **TOTAL** | **21** | **✅ 100% Complete** |

---

## Legend

- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete

---

## Notes

- Each task has clear file paths and responsibilities
- Dependencies are noted to guide implementation order
- Phase 1 is critical foundation for all other phases
- Suggest completing one phase before moving to next

---

**Last Updated**: Today
**Project**: Tenant Frontend BFF Implementation
EOF

---

## 🚀 Parallelization Opportunities

### Can Be Done in Parallel:

**Group A** (Start with 1.2, immediately after 1.1):

- `2.2` Verify Email - only needs 1.1 (REST client)
- `2.3` Request Password Reset - only needs 1.1
- `2.4` Reset Password - only needs 1.1
- `1.2` GraphQL Client - needs 1.1

**Group B** (After 1.3 is done, do in parallel):

- `1.4` Middleware - needs 1.3
- `1.5` Login Endpoint - needs 1.1, 1.3
- _(Both only need 1.3)_

**Group C** (After 1.5 is done):

- `2.1` Signup - needs 1.1, 1.3
- `1.6` Logout/Me - needs 1.3, 1.5
- _(Both can start once dependencies met)_

**Group D** (Frontend, can start early):

- `4.1` useAuth Hook - no dependencies
- `4.2` useGraphQL Hook - no dependencies
- _(But should wait until API routes exist)_

**Group E** (After API routes done):

- `4.3` Login Page - needs 4.1
- `4.4` Auth Pages - needs 4.1
- _(Can be done in parallel)_

### Recommended Parallel Strategy:

```
Day 1:
  1.1 (REST Client) [Foundation]
    ├─ 1.2 (GraphQL Client) [starts after 1.1]
    ├─ 2.2 (Verify Email) [starts after 1.1] ✓ PARALLEL
    ├─ 2.3 (Password Reset Request) [starts after 1.1] ✓ PARALLEL
    └─ 2.4 (Password Reset) [starts after 1.1] ✓ PARALLEL

Day 2:
  1.3 (Session Management) [depends on 1.1, 1.2]
    ├─ 1.4 (Middleware) [starts after 1.3] ✓ PARALLEL
    └─ 1.5 (Login Endpoint) [starts after 1.3] ✓ PARALLEL

Day 3:
  1.6 (Logout/Me) [depends on 1.3, 1.5]
  2.1 (Signup) [depends on 1.1, 1.3] ✓ PARALLEL with 1.6
  3.1 (GraphQL Endpoint) [depends on 1.3, 1.2] ✓ PARALLEL with 1.6, 2.1

Day 4:
  3.2 (Query Forwarding) [depends on 3.1]
  3.3 (Error Handling) [depends on 3.2]
  4.1 (useAuth Hook) [no dependencies] ✓ PARALLEL
  4.2 (useGraphQL Hook) [no dependencies] ✓ PARALLEL

Day 5:
  4.3 (Login Page) [depends on 4.1] ✓ PARALLEL with 4.4
  4.4 (Auth Pages) [depends on 4.1] ✓ PARALLEL with 4.3

Day 6:
  5.1 - 5.4 (Testing & Polish) [sequential]
```

### Team Assignment (if multiple developers):

**Developer 1** (Core auth flow):

- Day 1: 1.1
- Day 2: 1.3 → 1.5 (in parallel with 1.4)
- Day 3: 1.6 (in parallel with 2.1, 3.1)
- Day 4: 3.2 → 3.3

**Developer 2** (Extended auth endpoints):

- Day 1: 1.2 (after 1.1), then 2.2, 2.3, 2.4 (all in parallel)
- Day 2: (assist Developer 1 if needed)
- Day 3: 2.1
- Day 4: (assist with 4.1, 4.2)

**Developer 3** (Frontend/UI):

- Day 4: 4.1, 4.2 (in parallel)
- Day 5: 4.3, 4.4 (in parallel)
- Day 6: Assist with testing

### Key Parallelization Points:

1. **After 1.1** - Start 2.2, 2.3, 2.4 immediately (simple endpoints)
2. **After 1.3** - Start 1.4 and 1.5 in parallel
3. **After 1.5** - Start 2.1 and 1.6 in parallel, plus 3.1
4. **Frontend** - useAuth (4.1) and useGraphQL (4.2) can be done in parallel
5. **Auth Pages** - Login and signup pages can be done in parallel

---
