# ✅ GraphQL Code Generation Setup Complete

## 🎉 What's Been Added

Your Next.js BFF now has a complete GraphQL stack with type-safe operations:

### New Packages Installed ✅

```json
{
  "dependencies": {
    "@apollo/client": "^4.0.9",
    "graphql": "^16.12.0"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^6.0.1",
    "@graphql-codegen/client-preset": "^5.1.1",
    "@graphql-codegen/typescript": "^5.0.2",
    "@graphql-codegen/typescript-operations": "^5.0.2",
    "@graphql-codegen/typescript-react-apollo": "^4.3.3"
  }
}
```

### New Files Created ✅

```
lib/graphql/
├── client.ts                 # Apollo Client configuration
├── provider.tsx              # ApolloProvider wrapper
├── operations.ts             # GraphQL queries/mutations (examples)
└── index.ts                  # Module exports

codegen.ts                     # GraphQL Code Generator config
GRAPHQL_CODEGEN_GUIDE.md      # Comprehensive guide
```

## 🏗️ Architecture

### Complete Data Flow

```
┌─────────────────────────────────────┐
│  React Components                   │
│  useGetCurrentUserQuery()           │
│  useCreateEventMutation()           │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Apollo Client (Caching)            │
│  • InMemoryCache                    │
│  • Automatic updates                │
│  • Error handling                   │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  HttpLink                           │
│  uri: /api/graphql                  │
│  credentials: include               │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Next.js GraphQL Proxy              │
│  /api/graphql                       │
│  ✅ Session validation              │
│  ✅ Bearer token (auto-refresh)     │
│  ✅ User token from session         │
│  ✅ Tenant consistency validation   │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Backend Event Directory API        │
│  /graphql                           │
│  Returns data                       │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Update GraphQL Operations

Edit `lib/graphql/operations.ts` with your schema queries:

```typescript
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      firstName
      lastName
    }
  }
`

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      name
    }
  }
`
```

### 2. Generate Types and Hooks

```bash
npm run generate
```

This creates:
- `lib/graphql/generated/types.ts` - TypeScript types
- `lib/graphql/generated/hooks.ts` - React hooks

### 3. Use in Components

```typescript
'use client'

import { useGetCurrentUserQuery } from '@/lib/graphql/generated/hooks'

export function UserProfile() {
  const { data, loading, error } = useGetCurrentUserQuery()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.currentUser?.email}</div>
}
```

### 4. Wrap App with ApolloProvider

In your root layout:

```typescript
import { ApolloWrapper } from '@/lib/graphql/provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ApolloWrapper>
          {children}
        </ApolloWrapper>
      </body>
    </html>
  )
}
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `codegen.ts` | CodeGen configuration |
| `lib/graphql/client.ts` | Apollo Client setup |
| `lib/graphql/provider.tsx` | ApolloProvider wrapper |
| `lib/graphql/operations.ts` | GraphQL queries/mutations |
| `lib/graphql/index.ts` | Module exports |
| `lib/graphql/generated/types.ts` | Generated types (auto) |
| `lib/graphql/generated/hooks.ts` | Generated hooks (auto) |

## 📚 Documentation

- **`GRAPHQL_CODEGEN_GUIDE.md`** - Comprehensive guide with examples
- **`lib/graphql/operations.ts`** - Example operations with comments

## 🔄 Commands

```bash
# Generate types and hooks once
npm run generate

# Watch mode (auto-regenerate when editing operations)
npm run generate:watch

# Build (includes code generation)
npm build

# Develop with auto-generation
npm run dev & npm run generate:watch
```

## ✨ Features

### ✅ Type-Safe Operations
- Full TypeScript support
- Auto-generated hooks
- Query and mutation types
- Variable types

### ✅ Apollo Client Cache
- Automatic caching
- Manual cache updates
- Cache policies
- Optimistic responses

### ✅ Error Handling
- Network error handling
- GraphQL error handling
- Automatic 401 redirect
- Detailed logging

### ✅ Authentication
- Session cookie validation
- Bearer token (auto-refresh)
- User token management
- Tenant validation

### ✅ Performance
- In-memory caching
- Query deduplication
- Batch requests
- DevTools support

## 🔒 Security

All requests go through the Next.js proxy which:

✅ **Validates Session** - Checks httpOnly cookie
✅ **Manages Bearer Token** - Auto-refreshes before expiry  
✅ **Gets User Token** - From validated session
✅ **Validates Tenant** - Prevents cross-tenant access
✅ **Handles Errors** - Returns 401 for auth failures

**No tokens are ever exposed to the frontend!**

## 🎯 Workflow

### 1️⃣ Add Operation to `operations.ts`

```typescript
export const GET_USERS = gql`
  query GetUsers {
    users { id email }
  }
`
```

### 2️⃣ Run Generator

```bash
npm run generate
```

### 3️⃣ Use Hook in Component

```typescript
import { useGetUsersQuery } from '@/lib/graphql/generated/hooks'

export function Users() {
  const { data } = useGetUsersQuery()
  return <div>{data?.users?.length} users</div>
}
```

## 📊 What's Included

### Apollo Client Links
- **ErrorLink** - Handles errors and 401 redirects
- **LoggingLink** - Logs queries and responses
- **HttpLink** - Connects to `/api/graphql` proxy

### Cache Configuration
- **InMemoryCache** - Automatic caching
- **Type Policies** - Custom merge strategies
- **Normalized Cache** - Prevents data duplication

### Code Generation
- **TypeScript Plugin** - Generate types
- **Client Preset** - Apollo hooks
- **Operations Plugin** - Operation types
- **React Apollo Plugin** - React hooks

## 🚨 Error Handling

### 401 Unauthorized
```typescript
// Automatically redirects to /auth/login
```

### Network Errors
```typescript
const { error } = useGetUserQuery()
if (error?.networkError) {
  // Handle network error
}
```

### GraphQL Errors
```typescript
const { error } = useGetUserQuery()
if (error?.graphQLErrors) {
  error.graphQLErrors.forEach(err => {
    console.error(err.message)
  })
}
```

## 🎓 Best Practices

1. **Define Operations Near Usage**
   - Keep queries/mutations close to components
   - Use descriptive operation names

2. **Handle All States**
   ```typescript
   if (loading) return <Spinner />
   if (error) return <ErrorMessage error={error} />
   return <Data data={data} />
   ```

3. **Use Cache Wisely**
   - `cache-first` for static data
   - `network-only` for real-time data
   - `cache-and-network` for most cases

4. **Manage Cache on Logout**
   ```typescript
   apolloClient.cache.reset()
   ```

5. **Monitor Performance**
   - Use Apollo DevTools extension
   - Check bundle size
   - Monitor cache size

## 🐛 Troubleshooting

### Generated files not updating?
```bash
npm run generate
```

### Types not appearing?
```bash
# Clear and regenerate
rm -rf lib/graphql/generated
npm run generate
```

### Module not found errors?
```bash
npm install
npm run generate
```

### 401 redirect not working?
Check that:
1. Session cookie is being sent
2. Bearer token is valid
3. `/api/graphql` endpoint is accessible

## 📖 Next Steps

1. **Update `lib/graphql/operations.ts`** with your API schema
2. **Run `npm run generate`** to generate types and hooks
3. **Wrap app with `ApolloWrapper`** in root layout
4. **Import and use hooks** in components
5. **Test queries and mutations** in components
6. **Monitor with Apollo DevTools** browser extension

## 🎉 You Now Have

✅ Type-safe GraphQL operations
✅ Auto-generated React hooks
✅ Apollo Client caching
✅ Error handling
✅ Authentication integration
✅ Developer tools support
✅ Production-ready setup

## 📚 Resources

- **GRAPHQL_CODEGEN_GUIDE.md** - Full guide with examples
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

---

**Your Next.js BFF is now fully equipped with a modern GraphQL stack! 🚀**
