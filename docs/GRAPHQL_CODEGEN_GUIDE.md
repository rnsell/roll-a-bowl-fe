# GraphQL Code Generation Guide

## 🎯 Overview

This project now includes **GraphQL Code Generation** with **Apollo Client** for type-safe GraphQL operations in React.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Components                        │
│                                                                  │
│  useGetCurrentUserQuery()  (auto-generated hook)               │
│  useUpdateUserProfileMutation()  (auto-generated hook)         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Apollo Client                              │
│                                                                  │
│  • Caches data                                                  │
│  • Manages queries & mutations                                  │
│  • Handles errors                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js GraphQL Proxy                         │
│                   (/api/graphql)                                │
│                                                                  │
│  • Validates session cookie                                     │
│  • Gets Bearer token (auto-refreshed)                          │
│  • Gets User token from session                                │
│  • Forwards to backend with both tokens                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Backend Event Directory API                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### 1. Install Dependencies (Already Done ✅)

```bash
npm install @apollo/client graphql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/client-preset
```

### 2. Define Your GraphQL Operations

Add queries and mutations to `lib/graphql/operations.ts`:

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

### 3. Generate Types and Hooks

```bash
npm run generate
```

This creates:

- `lib/graphql/generated/types.ts` - TypeScript types
- `lib/graphql/generated/hooks.ts` - React hooks

### 4. Use in Components

```typescript
import {
  useGetUsersQuery,
  useCreateUserMutation,
} from "@/lib/graphql/generated/hooks";

export function Users() {
  const { data, loading, error } = useGetUsersQuery();
  const [createUser, { loading: creating }] = useCreateUserMutation();

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

## 📁 File Structure

```
lib/graphql/
├── client.ts                 # Apollo Client configuration
├── provider.tsx              # ApolloProvider wrapper component
├── operations.ts             # GraphQL queries and mutations
├── index.ts                  # Module exports
└── generated/
    ├── types.ts              # Generated TypeScript types
    └── hooks.ts              # Generated React hooks
```

## 🔧 Configuration

### `codegen.ts` - CodeGen Config

```typescript
const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql", // Backend GraphQL endpoint
  documents: ["app/**/*.{ts,tsx}"], // Where to find operations

  generates: {
    "./lib/graphql/generated/types.ts": {
      plugins: ["typescript"],
    },
    "./lib/graphql/generated/hooks.ts": {
      preset: "client",
      plugins: ["typescript-operations", "typescript-react-apollo"],
    },
  },
};
```

### Environment Variables

Add to `.env.local`:

```bash
# Backend API URL (for proxying requests)
NEXT_PUBLIC_API_URL=http://localhost:4000

# GraphQL Schema URL (for code generation)
# This points to your backend GraphQL endpoint
GRAPHQL_SCHEMA_URL=http://localhost:4000/graphql

# API Key (for Bearer token exchange)
API_KEY=your_api_key_here
```

## 📝 Writing GraphQL Operations

### Query with Variables

```typescript
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
      posts {
        id
        title
      }
    }
  }
`;
```

### Mutation

```typescript
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      firstName
      lastName
    }
  }
`;
```

### Subscription (Real-time updates)

```typescript
export const WATCH_USER_UPDATES = gql`
  subscription OnUserUpdate($userId: ID!) {
    userUpdated(userId: $userId) {
      id
      email
      updatedAt
    }
  }
`;
```

## 🎣 Using Generated Hooks

### Query Hook

```typescript
import { useGetUserQuery } from "@/lib/graphql/generated/hooks";

export function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useGetUserQuery({
    variables: { id: userId },
    fetchPolicy: "cache-first", // or 'network-only', 'cache-and-network'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>
        {data?.user?.firstName} {data?.user?.lastName}
      </h1>
      <p>{data?.user?.email}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Mutation Hook

```typescript
import { useUpdateUserMutation } from "@/lib/graphql/generated/hooks";

export function UpdateUserForm({ userId }: { userId: string }) {
  const [updateUser, { loading, error }] = useUpdateUserMutation({
    onCompleted: (data) => {
      console.log("User updated:", data);
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await updateUser({
      variables: {
        id: userId,
        input: {
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" />
      <input name="lastName" />
      <button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update"}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

## 🔄 Apollo Client Cache

### Automatic Cache Updates

```typescript
const [createUser] = useCreateUserMutation({
  update(cache, { data }) {
    // Read existing data
    const existingData = cache.readQuery({ query: GET_USERS });

    // Update cache with new user
    cache.writeQuery({
      query: GET_USERS,
      data: {
        users: [...(existingData?.users || []), data.createUser],
      },
    });
  },
});
```

### Cache Policies

```typescript
useGetUserQuery({
  variables: { id: "1" },
  fetchPolicy: "cache-first", // Use cache if available
  // 'network-only'               // Always fetch from network
  // 'cache-and-network'          // Fetch from both (show cache first)
  // 'no-cache'                   // Skip cache
});
```

## ⚙️ Advanced Configuration

### Custom Scalars

In `codegen.ts`:

```typescript
config: {
  scalars: {
    DateTime: 'string',
    Date: 'string',
    JSON: 'Record<string, any>',
  }
}
```

### Type Policies

In `lib/graphql/client.ts`:

```typescript
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    User: {
      fields: {
        posts: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});
```

## 🚨 Error Handling

### Network Errors

```typescript
const errorLink = new ApolloLink((operation, forward) => {
  return forward(operation).catch((error) => {
    if (error.networkError) {
      // Handle network errors
      if (error.networkError.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = "/auth/login";
      }
    }
    throw error;
  });
});
```

### GraphQL Errors

```typescript
const { data, error } = useGetUserQuery();

if (error?.graphQLErrors?.length) {
  error.graphQLErrors.forEach((err) => {
    console.error("GraphQL Error:", err.message);
  });
}
```

## 📊 Workflow

### 1. Define Operation

```typescript
// lib/graphql/operations.ts
export const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
    }
  }
`;
```

### 2. Generate Types

```bash
npm run generate
```

### 3. Use in Component

```typescript
import { useGetPostsQuery } from "@/lib/graphql/generated/hooks";

export function Posts() {
  const { data, loading } = useGetPostsQuery();

  return (
    <div>
      {data?.posts?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## 📚 Commands

```bash
# Generate types and hooks once
npm run generate

# Generate in watch mode (auto-regenerate when you edit operations)
npm run generate:watch

# Build with code generation
npm build  # Runs: graphql-codegen && next build

# Development (with auto-generation)
npm run dev & npm run generate:watch
```

## 🔒 Security Notes

All GraphQL requests go through your Next.js proxy endpoint (`/api/graphql`), which:

✅ Validates session cookie
✅ Manages Bearer token (auto-refreshed)
✅ Validates tenant consistency
✅ Never exposes tokens to frontend
✅ Handles authentication errors

## 🎯 Best Practices

1. **Keep Operations Close to Usage**

   - Define queries/mutations near where they're used
   - Use descriptive operation names

2. **Use Proper Fragments**

   ```typescript
   const USER_FRAGMENT = gql`
     fragment UserFields on User {
       id
       email
       firstName
       lastName
     }
   `;

   const GET_USER = gql`
     query GetUser($id: ID!) {
       user(id: $id) {
         ...UserFields
       }
     }
     ${USER_FRAGMENT}
   `;
   ```

3. **Manage Cache Carefully**

   - Use `refetchQueries` for manual updates
   - Use `update` for complex cache updates
   - Clear cache on logout

4. **Error Handling**

   - Always handle loading and error states
   - Provide user-friendly error messages
   - Log errors for debugging

5. **Performance**
   - Use `cache-first` policy when appropriate
   - Implement pagination for large lists
   - Monitor bundle size

## 🐛 Troubleshooting

### "Cannot find module '@apollo/client'"

```bash
npm install @apollo/client graphql
```

### Generated types not updating

```bash
npm run generate
```

### Hooks not appearing after codegen

1. Check `lib/graphql/operations.ts` has your queries
2. Run `npm run generate`
3. Import from `lib/graphql/generated/hooks`

### Type errors in generated code

```bash
# Clear cache and regenerate
rm -rf lib/graphql/generated
npm run generate
```

## 📖 Resources

- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

## 🎓 Next Steps

1. ✅ Update `lib/graphql/operations.ts` with your actual GraphQL schema
2. ✅ Run `npm run generate` to create typed hooks
3. ✅ Import and use hooks in your components
4. ✅ Use Apollo DevTools for debugging (browser extension)
5. ✅ Monitor cache with Apollo Client DevTools
