# Apollo Client Suspense Integration Patterns

Modern patterns for integrating Apollo GraphQL data fetching with React Suspense in Next.js 14+

---

## Overview

React Suspense allows you to handle loading states declaratively at the component level. Apollo Client 3.8+ provides several hooks to work seamlessly with Suspense:

- **`useSuspenseQuery`** - Simple Suspense-enabled queries
- **`useBackgroundQuery` + `useReadQuery`** - Render-as-you-fetch pattern
- **`useSuspenseMutation`** - Suspense-enabled mutations (Apollo 3.9+)

---

## Pattern 1: Simple Suspense with `useSuspenseQuery`

The simplest approach - component suspends while data loads.

### Setup: Install the hook capability

First, ensure you have Apollo Client 3.8+:

```bash
npm list @apollo/client
# Should show 4.0.9 or higher
```

### Implementation

```typescript
// lib/graphql/operations.ts
import { gql } from "@apollo/client";

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

export const GET_PLACES = gql`
  query GetPlaces($page: Int, $pageSize: Int) {
    places(page: $page, pageSize: $pageSize) {
      items {
        id
        name
        slug
        createdAt
      }
      total
      hasMore
    }
  }
`;
```

```typescript
// app/dashboard/components/user-profile.tsx
"use client";

import { useSuspenseQuery } from "@apollo/client";
import { GetCurrentUserDocument } from "@/lib/graphql/generated";

/**
 * Component that suspends while loading user data
 * Must be wrapped in a Suspense boundary
 */
export function UserProfile() {
  const { data } = useSuspenseQuery(GetCurrentUserDocument);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">
        Welcome, {data.me.fullName}! 👋
      </h2>
      <div className="space-y-2">
        <p>
          <strong>Email:</strong> {data.me.email}
        </p>
        <p>
          <strong>Status:</strong> {data.me.status}
        </p>
        <p>
          <strong>Verified:</strong> {data.me.emailVerified ? "✅" : "❌"}
        </p>
      </div>
    </div>
  );
}
```

```typescript
// app/dashboard/page.tsx
"use client";

import { Suspense } from "react";
import { UserProfile } from "./components/user-profile";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        {/* Suspense boundary with fallback */}
        <Suspense fallback={<LoadingProfile />}>
          <UserProfile />
        </Suspense>
      </div>
    </main>
  );
}

function LoadingProfile() {
  return (
    <div className="p-6 bg-white rounded-lg shadow animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
}
```

### Pros & Cons

✅ **Pros:**

- Simple and readable
- Automatic loading state handling
- Works well with Suspense boundaries
- Apollo caching still works

❌ **Cons:**

- Suspends entire component
- Can't show partial data
- Delays rendering until all data loads

---

## Pattern 2: Render-as-You-Fetch with `useBackgroundQuery` + `useReadQuery`

Start fetching data before component mounts. Better performance.

```typescript
// app/dashboard/components/places-list.tsx
"use client";

import { useReadQuery } from "@apollo/client";
import { GetPlacesDocument } from "@/lib/graphql/generated";

interface PlacesListProps {
  queryRef: any; // Type from useBackgroundQuery
}

/**
 * Component that reads already-fetched data
 * Suspends if data not yet available
 */
export function PlacesList({ queryRef }: PlacesListProps) {
  const { data } = useReadQuery(queryRef);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.places.items.map((place) => (
        <div key={place.id} className="p-4 border rounded-lg">
          <h3 className="font-bold text-lg">{place.name}</h3>
          <p className="text-sm text-gray-600">{place.slug}</p>
          <p className="text-xs text-gray-500">
            Created: {new Date(place.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
```

```typescript
// app/dashboard/page.tsx
"use client";

import { Suspense } from "react";
import { useBackgroundQuery } from "@apollo/client";
import {
  GetCurrentUserDocument,
  GetPlacesDocument,
} from "@/lib/graphql/generated";
import { UserProfile } from "./components/user-profile";
import { PlacesList } from "./components/places-list";

export default function DashboardPage() {
  // Start fetching both queries BEFORE rendering components
  const [userQueryRef] = useBackgroundQuery(GetCurrentUserDocument);
  const [placesQueryRef] = useBackgroundQuery(GetPlacesDocument, {
    variables: { page: 1, pageSize: 10 },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>

        {/* User Profile Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
          <Suspense fallback={<ProfileSkeleton />}>
            <UserProfileWithData queryRef={userQueryRef} />
          </Suspense>
        </section>

        {/* Places List Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Places</h2>
          <Suspense fallback={<PlacesSkeleton />}>
            <PlacesList queryRef={placesQueryRef} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

function UserProfileWithData({ queryRef }: any) {
  const { data } = useReadQuery(queryRef);
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold">Welcome, {data.me.fullName}!</h3>
    </div>
  );
}

function ProfileSkeleton() {
  return <div className="h-24 bg-gray-300 rounded animate-pulse"></div>;
}

function PlacesSkeleton() {
  return <div className="h-64 bg-gray-300 rounded animate-pulse"></div>;
}
```

### Pros & Cons

✅ **Pros:**

- Better performance (fetching starts earlier)
- Can show multiple sections independently
- Parallel data fetching
- Render-as-you-fetch pattern

❌ **Cons:**

- More boilerplate code
- Need to pass queryRef around
- Requires understanding of refs

---

## Pattern 3: Server Components with Suspense (Recommended for Next.js)

Use Server Components to fetch data server-side, then stream to client.

```typescript
// lib/graphql/server-client.ts
"use server";

import { apolloClient } from "./client";
import { GetCurrentUserDocument, GetPlacesDocument } from "./generated";

/**
 * Server-side Apollo queries
 * These run on the server and return data directly
 */

export async function fetchCurrentUser() {
  try {
    const { data } = await apolloClient.query({
      query: GetCurrentUserDocument,
    });
    return data.me;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
}

export async function fetchPlaces(page: number = 1, pageSize: number = 10) {
  try {
    const { data } = await apolloClient.query({
      query: GetPlacesDocument,
      variables: { page, pageSize },
    });
    return data.places;
  } catch (error) {
    console.error("Failed to fetch places:", error);
    throw error;
  }
}
```

```typescript
// app/dashboard/page.tsx (Server Component)
import { Suspense } from "react";
import { fetchCurrentUser, fetchPlaces } from "@/lib/graphql/server-client";

async function UserProfileSection() {
  const user = await fetchCurrentUser();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">Welcome, {user.fullName}! 👋</h2>
      <p className="text-gray-600">Email: {user.email}</p>
    </div>
  );
}

async function PlacesSection() {
  const places = await fetchPlaces(1, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {places.items.map((place) => (
        <div key={place.id} className="p-4 border rounded-lg">
          <h3 className="font-bold">{place.name}</h3>
          <p className="text-sm text-gray-600">{place.slug}</p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>

        {/* Suspense boundaries for streaming */}
        <Suspense fallback={<ProfileSkeleton />}>
          <UserProfileSection />
        </Suspense>

        <Suspense fallback={<PlacesSkeleton />}>
          <PlacesSection />
        </Suspense>
      </div>
    </main>
  );
}

function ProfileSkeleton() {
  return <div className="h-24 bg-gray-300 rounded animate-pulse"></div>;
}

function PlacesSkeleton() {
  return <div className="h-64 bg-gray-300 rounded animate-pulse"></div>;
}
```

### Pros & Cons

✅ **Pros:**

- Data fetching happens server-side (secure)
- Streaming UI (shows sections as they load)
- Better SEO
- No client-side Apollo Provider needed
- Simplest code

❌ **Cons:**

- Limited interactivity in data-fetching sections
- Can't use client-only features in data section

---

## Comparison Table

| Pattern              | Best For                  | Complexity | Performance | When Ready              |
| -------------------- | ------------------------- | ---------- | ----------- | ----------------------- |
| `useSuspenseQuery`   | Simple client queries     | Low        | Good        | When all data ready     |
| `useBackgroundQuery` | Multiple parallel queries | Medium     | Better      | Staggered (per section) |
| Server Components    | Next.js app               | Low        | Best        | Streaming               |

---

## Migration Guide: Your Current Dashboard

To migrate your current dashboard to Suspense:

### Current Code (Direct apolloClient.query):

```typescript
"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/graphql/client";
import { GetCurrentUserDocument } from "@/lib/graphql/generated";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apolloClient
      .query({ query: GetCurrentUserDocument })
      .then((res) => setUser(res.data.me))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>Welcome, {user.fullName}!</div>;
}
```

### Migrated Code (Suspense):

```typescript
"use client";

import { Suspense } from "react";
import { useSuspenseQuery } from "@apollo/client";
import { GetCurrentUserDocument } from "@/lib/graphql/generated";

function UserProfile() {
  const { data } = useSuspenseQuery(GetCurrentUserDocument);
  return <div>Welcome, {data.me.fullName}!</div>;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile />
    </Suspense>
  );
}
```

---

## Recommendation for Your Project

I recommend **Pattern 3 (Server Components)** because:

1. ✅ Aligns with Next.js 14+ App Router best practices
2. ✅ No client-side Apollo Provider needed
3. ✅ Data fetching is secure (stays server-side)
4. ✅ Streaming UI for better perceived performance
5. ✅ Simpler code overall

Would you like me to:

1. Convert your dashboard to use Server Components with Suspense?
2. Set up `useSuspenseQuery` hooks for client-side queries?
3. Create both patterns as options?
