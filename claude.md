# Tenant Management Frontend - Claude Context

## Project Overview

This is a **Next.js 14** tenant management application with a custom Express server, built using **Bun** as the runtime and package manager. The application manages tenant tracking, rent management, and maintenance requests.

## 🔧 Tech Stack

### Runtime & Package Manager
- **Bun** - Primary runtime and package manager
  - Use `bun run <script>` for all npm scripts
  - Use `bun add <package>` to install dependencies
  - Use `bun add -d <package>` for dev dependencies
  - Lock file: `bun.lockb`

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

### Backend/API Layer
- **Custom Express Server** (`server.ts`)
- **Apollo Client** (GraphQL)
- **Auto-generated REST Client** (from OpenAPI schema)
- **Axios** (HTTP client with automatic Bearer token management)

### Testing
- **Playwright** - E2E testing

### Code Generation
- **GraphQL Codegen** - Generates TypeScript types from GraphQL schema
- **swagger-typescript-api** - Generates TypeScript Axios client from OpenAPI schema

## 📁 Key Architecture

### Backend Client Architecture (Recently Refactored)

The backend client layer uses a **generated-first approach**:

```
lib/backend/
├── api-token-manager.ts          # Standalone Bearer token management
├── create-axios-client.ts        # Factory for authenticated axios instances
├── auth-client.ts                # High-level auth methods with Result types
├── generated/
│   ├── V1.ts                     # Auto-generated API methods
│   ├── data-contracts.ts         # Auto-generated TypeScript types
│   ├── http-client.ts            # Generated HTTP client base
│   └── api-client.ts             # Configured singleton with token management
├── graphql-client.ts             # GraphQL client (Apollo)
└── index.ts                      # Centralized exports
```

### Key Patterns

#### 1. API Token Management
- **ApiTokenManager** handles automatic Bearer token refresh
- Tokens are obtained by exchanging API key for JWT
- Thread-safe token refresh (prevents duplicate requests)
- 5-minute refresh threshold before expiry

#### 2. Auto-Generated API Client
- Generated from OpenAPI schema at `http://localhost:3000/open-api/schema`
- Run `bun run generate:api` to regenerate
- All API methods automatically include Bearer token
- Type-safe requests/responses

#### 3. Auth Client (High-Level Wrapper)
- Built on top of generated API client
- Uses `Result<T, E>` pattern for explicit error handling
- Enumerated error types for each operation
- Clean interfaces without Axios response wrappers

#### 4. Error Handling
- Custom exception types in `lib/exceptions`
- Backend errors mapped to service exceptions
- Result type prevents unhandled errors

## 🎯 Common Tasks

### Development
```bash
bun run dev          # Start dev server (runs server.ts)
bun run build        # Build for production
bun run start        # Start production server
```

### Code Quality
```bash
bun run check        # Run all checks (type + lint + format)
bun run type-check   # TypeScript type checking
bun run lint         # ESLint
bun run lint:fix     # Auto-fix ESLint issues
bun run format       # Format with Prettier
bun run format:check # Check formatting without changes
```

### Code Generation
```bash
bun run generate      # Generate GraphQL types
bun run generate:api  # Generate REST API client from OpenAPI
```

### Testing
```bash
bun run test         # Run Playwright tests
bun run test:ui      # Run tests in UI mode
bun run test:headed  # Run tests in headed mode
bun run test:debug   # Debug tests
```

## 🔐 Authentication Flow

### Tenant-Level Authentication (API Key → Bearer Token)
1. API key stored in `NEXT_PUBLIC_API_KEY` or `API_KEY`
2. `ApiTokenManager` exchanges API key for JWT Bearer token
3. Token automatically added to all API requests via axios interceptor
4. Token auto-refreshes 5 minutes before expiry

### User-Level Authentication (Email/Password → Session)
1. User logs in via `authClient.login({ email, password })`
2. Backend returns user JWT token
3. Session stored server-side with `sessionManager`
4. Session cookie sent to client
5. GraphQL requests include both Bearer token and user token

## 📝 Usage Examples

### Using the Auth Client
```typescript
import { authClient } from '@/lib/backend'

// Login with Result type
const result = await authClient.login({ email, password })

if (result.ok) {
  console.log('User:', result.value.user)
  console.log('Token:', result.value.token)
} else {
  // TypeScript knows all possible error types
  if (result.error instanceof InvalidCredentialsError) {
    console.error('Wrong email or password')
  } else if (result.error instanceof TooManyLoginAttemptsError) {
    console.error('Too many attempts')
  }
}
```

### Using the Generated API Client
```typescript
import api from '@/lib/backend/generated/api-client'

// All methods automatically include Bearer token
const response = await api.infoControllerGetTenantInfo()
const tenantInfo = response.data.tenant
```

### Using GraphQL Client
```typescript
import { graphqlClient } from '@/lib/backend'

const data = await graphqlClient.query({
  query: GET_TENANT,
  variables: { id: 1 }
})
```

## 🚨 Important Notes

### Bun-Specific Considerations
- Always use `bun` commands, not `npm` or `yarn`
- Some packages may have compatibility issues with Bun
- If you encounter issues, check Bun compatibility first

### API Client Generation
- Generated files are in `lib/backend/generated/` - **DO NOT manually edit**
- Regenerate when backend OpenAPI schema changes
- Generated types may use generic `object` for some fields - use type assertions

### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_API_KEY` or `API_KEY` - API key for tenant authentication
- Check `.env.local` for other configuration

### Session Management
- Sessions are server-side only (never sent to client)
- Session cookies are httpOnly and secure
- GraphQL proxy forwards both Bearer token and user token

## 🔄 Recent Changes

### Backend Client Refactoring (December 2024)
- ✅ Removed old manual RestClient
- ✅ Built standalone ApiTokenManager
- ✅ Created axios client factory
- ✅ Auto-generate API client from OpenAPI
- ✅ Built high-level AuthClient with Result types
- ✅ Updated all consumers (auth routes, GraphQL proxy, tenant validation)

## 📚 Key Files to Know

- `server.ts` - Custom Express server entry point
- `lib/backend/index.ts` - All backend client exports
- `lib/backend/auth-client.ts` - High-level auth methods
- `lib/backend/generated/api-client.ts` - Generated API singleton
- `lib/backend/api-token-manager.ts` - Token lifecycle management
- `lib/session/` - Server-side session management
- `server/routes/` - Express route handlers
- `codegen.ts` - GraphQL codegen configuration

## 🎨 Code Style

- **Prettier** for formatting (no semicolons, single quotes)
- **ESLint** with Next.js config
- **TypeScript** strict mode enabled
- Result type pattern for error handling
- Functional components with hooks

## 🤖 Working with Claude Code

### Before Making Changes
- Check if backend server is running for API generation
- Run `bun run check` to verify current state
- Read relevant files before editing

### After Making Changes
- Run `bun run check` to verify changes
- Update generated clients if schema changed
- Test authentication flows if auth-related

### Debugging
- Check server logs (Express server outputs via Pino)
- Use browser DevTools Network tab for API requests
- Check session cookies in browser
- Verify Bearer token in request headers
