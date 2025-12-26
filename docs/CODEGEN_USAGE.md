# GraphQL Code Generation - Setup & Usage

## 🎯 Overview

Since this app is a **BFF (Backend for Frontend) proxy**, it doesn't run a GraphQL server locally. Instead, it proxies requests to your backend GraphQL API.

The code generation needs to point to the **actual backend GraphQL endpoint** to introspect the schema and generate types and hooks.

## 🚀 Quick Start

### 1. Set Backend GraphQL URL

In your `.env.local`:

```bash
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql
```

Or pass it directly when running codegen:

```bash
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql npm run generate
```

### 2. Run Code Generation

```bash
npm run generate
```

This will:
- Connect to your backend GraphQL endpoint
- Introspect the schema
- Generate TypeScript types in `lib/graphql/generated/types.ts`
- Generate React hooks in `lib/graphql/generated/hooks.ts`

### 3. Add Your GraphQL Operations

Edit `lib/graphql/operations.ts`:

```typescript
import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      firstName
      lastName
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
    }
  }
`;
```

### 4. Regenerate

```bash
npm run generate
```

New hooks will be created:
- `useGetUsersQuery()`
- `useCreateUserMutation()`

### 5. Use in Components

```typescript
import { useGetUsersQuery } from "@/lib/graphql/generated/hooks";

export function Users() {
  const { data, loading, error } = useGetUsersQuery();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.users?.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
```

## 📝 Environment Variables

### `GRAPHQL_SCHEMA_URL` (Required for Code Generation)

Points to the backend GraphQL endpoint.

**Development:**
```bash
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql
```

**Production:**
```bash
GRAPHQL_SCHEMA_URL=https://api.example.com/graphql
```

**With Authentication (if needed):**
```bash
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql
# Then use .env file with auth headers if backend requires it
```

### `NEXT_PUBLIC_API_URL` (For API Proxying)

Base URL of your backend API (used by the BFF proxy).

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### `API_KEY` (For Bearer Token Exchange)

API key used to exchange for tenant-level Bearer token.

```bash
API_KEY=sk_live_xxxxx
```

## 🔄 Workflow

### Local Development

**Terminal 1 - Backend API (Event Directory):**
```bash
cd ../event-directory-api
npm run dev
# Running on http://localhost:3000
# GraphQL endpoint: http://localhost:3000/graphql
```

**Terminal 2 - Watch Codegen (Optional):**
```bash
cd tenant-fe
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql npm run generate:watch
```

**Terminal 3 - Frontend BFF:**
```bash
cd tenant-fe
npm run dev
# Running on http://localhost:3001 (or next available port)
```

### Generate Types Once

```bash
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql npm run generate
```

### Build with Code Generation

```bash
npm build
# Runs: graphql-codegen && next build
```

## 🛠️ NPM Scripts

```bash
# Generate types and hooks once
npm run generate

# Watch mode (auto-regenerate when you edit operations)
npm run generate:watch

# Build (includes code generation automatically)
npm build

# Develop
npm run dev
```

## 📋 Configuration File

**Location:** `codegen.ts`

**Key Settings:**
```typescript
const schemaUrl = process.env.GRAPHQL_SCHEMA_URL
// ↓ Falls back to localhost:3000 if not set
const config: CodegenConfig = {
  schema: schemaUrl || 'http://localhost:3000/graphql',
  documents: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', '!**/*.generated.ts'],
  // ... rest of config
}
```

## 🚨 Common Issues

### "Cannot fetch GraphQL schema"

**Problem:** Backend GraphQL endpoint is not accessible

**Solution:**
```bash
# Make sure backend is running on port 3000
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql npm run generate

# Check backend is at correct URL
curl http://localhost:3000/graphql
```

### "Cannot find module generated"

**Problem:** Generated files don't exist yet

**Solution:**
```bash
npm run generate
```

### "ignoreNoDocuments error"

**Problem:** No GraphQL operations defined

**Solution:** Add operations to `lib/graphql/operations.ts`, then run:
```bash
npm run generate
```

### "Wrong schema being used"

**Problem:** Codegen using wrong GraphQL schema

**Solution:** Check `GRAPHQL_SCHEMA_URL` environment variable:
```bash
echo $GRAPHQL_SCHEMA_URL
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql npm run generate
```

### "Connection refused on localhost:3000"

**Problem:** Backend API not running

**Solution:**
```bash
# Start the backend Event Directory API first
cd ../event-directory-api
npm run dev
# Wait for it to be ready on http://localhost:3000

# Then in another terminal
cd tenant-fe
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql npm run generate
```

## 🔒 Security Notes

### For Local Development
```bash
GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql
```

### For Production
```bash
GRAPHQL_SCHEMA_URL=https://api.example.com/graphql
```

**Important:** 
- Code generation only needs **schema introspection** (no auth required)
- It runs at **build time**, not runtime
- Generated files are committed to git
- Production builds include pre-generated types

## 📊 Generated Files

### `lib/graphql/generated/types.ts`
- TypeScript types for GraphQL schema
- Custom scalar mappings
- Enum definitions
- Input types

### `lib/graphql/generated/hooks.ts`
- React hooks for queries (`useGetUsersQuery`)
- React hooks for mutations (`useCreateUserMutation`)
- Type-safe variables and results

## 🎯 Best Practices

1. **Always set `GRAPHQL_SCHEMA_URL`** before running codegen
2. **Commit generated files** to git
3. **Regenerate after schema changes** on backend
4. **Use watch mode** during development
5. **Check generated types** for autocomplete in IDE
6. **Define operations near components** that use them

## 📚 References

- See `GRAPHQL_CODEGEN_GUIDE.md` for detailed examples
- See `codegen.ts` for configuration details
- See `.env.example` for environment variable template

## ✅ Checklist

- [ ] Backend GraphQL API is running on http://localhost:3000
- [ ] `GRAPHQL_SCHEMA_URL` is set in `.env.local` to http://localhost:3000/graphql
- [ ] Run `npm run generate` successfully
- [ ] Generated files exist in `lib/graphql/generated/`
- [ ] Added GraphQL operations to `lib/graphql/operations.ts`
- [ ] Generated hooks are available in `lib/graphql/generated/hooks.ts`
- [ ] Imported and used hooks in components

Ready to generate! 🚀
