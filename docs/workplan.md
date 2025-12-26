# Tenant Frontend - Work Plan

## 📋 Overview

A modern Next.js 14 tenant management application with a **BFF (Backend for Frontend)** pattern.

### Key Architecture
- **API Clients**: Event Directory API (GraphQL + REST)
- **Frontend**: Next.js 14 app with React 18 & TypeScript
- **Next.js BFF**: Internal API routes/endpoints that wrap the backend API
- **Auth Flow**: Server-side authentication in Next.js, frontend consumes Next.js endpoints

---

## 🏗️ Architecture Pattern: Backend for Frontend (BFF)

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend Components (React 18)                              │
│ - Pages, Components, Hooks                                  │
│ - Consume Next.js API endpoints only                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│ Next.js 14 API Routes (BFF Layer)                           │
│ - /api/auth/* (authentication endpoints)                    │
│ - /api/graphql (GraphQL proxy + data composition)           │
│ - /api/* (business logic endpoints)                         │
│                                                              │
│ Responsibilities:                                           │
│ - Handle authentication flows (login, signup, etc.)         │
│ - Manage JWT tokens server-side                             │
│ - Call Event Directory API                                  │
│ - Transform/compose API responses                           │
│ - Session management for frontend                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓ HTTP/GraphQL
┌─────────────────────────────────────────────────────────────┐
│ Event Directory Backend API                                 │
│ - POST /auth/token (API key → JWT)                          │
│ - POST /auth/login (email/password → JWT)                   │
│ - POST /graphql (data queries/mutations)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Server-Side Authentication (Secure)
1. **Frontend** → Sends credentials to `Next.js:/api/auth/login`
2. **Next.js** → Calls `Backend:/auth/login`
3. **Backend** → Returns JWT token
4. **Next.js** → Stores JWT server-side, creates session cookie for frontend
5. **Frontend** → Receives session cookie (httpOnly, Secure)
6. **Frontend** → On subsequent requests, session cookie automatically sent
7. **Next.js** → Uses stored JWT to call backend API on behalf of user

### Benefits
- ✅ JWT tokens never exposed to frontend
- ✅ Tokens managed securely on server
- ✅ Frontend only needs session cookie
- ✅ CSRF protection built-in
- ✅ Easy token refresh server-side
- ✅ Consistent session management

---

## 🛠️ Required Components

### 1. Backend API Clients (`lib/backend/`)
- [ ] REST client for auth endpoints (`/auth/token`, `/auth/login`, etc.)
- [ ] GraphQL client for backend queries/mutations
- [ ] Error handling and response parsing
- [ ] Token refresh logic

### 2. Next.js API Routes - Authentication (`app/api/auth/`)
- [ ] `POST /api/auth/login` - Login endpoint
- [ ] `POST /api/auth/signup` - Registration endpoint
- [ ] `POST /api/auth/logout` - Logout endpoint
- [ ] `POST /api/auth/verify-email` - Email verification
- [ ] `POST /api/auth/request-password-reset` - Password reset request
- [ ] `POST /api/auth/reset-password` - Password reset
- [ ] `GET /api/auth/me` - Get current user/session
- [ ] Session/token management middleware

### 3. Next.js API Routes - GraphQL (`app/api/graphql.ts`)
- [ ] GraphQL endpoint wrapper
- [ ] Forward GraphQL queries to backend
- [ ] Add authentication context (JWT from server storage)
- [ ] Handle authorization/permissions
- [ ] Cache management (optional)

### 4. Session/Token Management (`lib/session/`)
- [ ] Server-side token storage (memory, Redis, or database)
- [ ] Session cookie management
- [ ] Token refresh logic
- [ ] Session cleanup on logout

### 5. Authentication Hook (`hooks/useAuth`)
- [ ] Current user/tenant context
- [ ] Login/logout functions
- [ ] Auth loading/error states
- [ ] User data management
- [ ] Calls Next.js `/api/auth/*` endpoints

### 6. Next.js Middleware (`middleware.ts`)
- [ ] Session cookie validation
- [ ] Protected route checking
- [ ] Redirect to /auth/login if no session
- [ ] Session refresh before expiry

### 7. Authentication Pages (`app/auth/`)
- [ ] Login page (calls `/api/auth/login`)
- [ ] Signup page (calls `/api/auth/signup`)
- [ ] Email verification page
- [ ] Password reset pages
- [ ] Error handling and user feedback

### 8. GraphQL Client (`hooks/useGraphQL.ts` or similar)
- [ ] Apollo/urql/graphql-request wrapper
- [ ] Calls Next.js `/api/graphql` endpoint
- [ ] Automatic session cookie handling
- [ ] Query/mutation helpers

---

## ✅ Decided Configuration

| Aspect | Decision |
|--------|----------|
| **Architecture** | BFF (Backend for Frontend) |
| **API Structure** | Next.js wraps Event Directory API |
| **Token Storage** | Server-side only (Next.js keeps JWT) |
| **Session Cookie** | httpOnly, Secure, SameSite |
| **Token Expiration** | 1 hour (backend) |
| **Refresh Strategy** | Server-side token refresh |
| **API Key Storage** | Environment variables only |
| **Frontend Consumption** | Next.js endpoints only |

---

## 📋 Next.js API Endpoints to Create

### Authentication API (`/api/auth/`)
```typescript
POST   /api/auth/login              // { email, password } → { user, sessionId }
POST   /api/auth/signup             // { email, password, firstName, lastName } → { user, sessionId }
POST   /api/auth/logout             // Delete session
GET    /api/auth/me                 // Get current user from session
POST   /api/auth/verify-email       // { token } → { success }
POST   /api/auth/request-password-reset // { email } → { success }
POST   /api/auth/reset-password     // { token, newPassword } → { success }
```

### GraphQL API (`/api/graphql`)
```typescript
POST   /api/graphql                 // { query, variables } → GraphQL response
// Uses server-side JWT to authenticate with backend
```

### Optional API Routes
```typescript
POST   /api/places                  // List places with pagination
POST   /api/places/[id]             // Get single place
// ... other domain-specific endpoints as needed
```

---

## 🎯 Implementation Roadmap

### Phase 1: Server-Side Infrastructure
1. [ ] Create backend API clients (REST + GraphQL)
2. [ ] Create session/token management utilities
3. [ ] Implement Next.js middleware for session validation
4. [ ] Create `/api/auth/login` endpoint
5. [ ] Create `/api/auth/logout` endpoint
6. [ ] Create `/api/auth/me` endpoint (get current user)

### Phase 2: Authentication API Routes
7. [ ] Create `/api/auth/signup` endpoint
8. [ ] Create `/api/auth/verify-email` endpoint
9. [ ] Create `/api/auth/request-password-reset` endpoint
10. [ ] Create `/api/auth/reset-password` endpoint

### Phase 3: GraphQL Proxy
11. [ ] Create `/api/graphql` endpoint
12. [ ] Forward queries to backend with authentication
13. [ ] Handle errors and responses

### Phase 4: Frontend Integration
14. [ ] Create auth context hook (useAuth)
15. [ ] Create GraphQL hook (useGraphQL)
16. [ ] Build login page (calls `/api/auth/login`)
17. [ ] Build signup page (calls `/api/auth/signup`)
18. [ ] Add middleware for route protection

### Phase 5: Polish & Testing
19. [ ] Test complete auth flow end-to-end
20. [ ] Handle edge cases and errors
21. [ ] Add loading states and error messages
22. [ ] Security review

---

## 📚 Related Files
- Main API: `/event-directory-api/` (symlinked)
- **AUTH_DOCUMENT**: `/event-directory-api/docs/AUTH_DOCUMENT.md` ← Backend auth spec
- API Docs: `/event-directory-api/docs/API_DOCUMENTATION.md`
- GraphQL Schema: `/event-directory-api/docs/GRAPHQL_SCHEMA.md`
- Auth Demo: `/event-directory-api/scripts/graphql-auth-demo.sh`

---

**Status**: ✅ Architecture clarified as BFF pattern, ready to begin implementation!
