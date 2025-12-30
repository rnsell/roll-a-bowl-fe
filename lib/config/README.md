# Configuration System

This directory contains the configuration system for the application, with separate handling for public (client-safe) and private (server-only) configuration values.

## Architecture

### Public Configuration (`public/config.ts`)
- **Purpose**: Safe values that can be bundled into client-side JavaScript
- **Source**: Only `NEXT_PUBLIC_*` environment variables
- **Usage**: Can be used in any React component (client or server)
- **Access**: Via `PublicConfigProvider` and `usePublicConfig()` hook

### Private Configuration (`private/config.ts`)
- **Purpose**: Sensitive values that must never be exposed to the client
- **Source**: Regular environment variables (without `NEXT_PUBLIC_` prefix)
- **Usage**: Only in server-side code (API routes, server components, middleware)
- **Access**: Direct import: `import { config } from '@/lib/config'`

## Usage Examples

### Using Public Config in Client Components

```tsx
'use client'

import { usePublicConfig } from '@/lib/config'

export function MyComponent() {
  const config = usePublicConfig()
  
  return (
    <div>
      <h1>{config.appName}</h1>
      {config.debugMode && <div>Debug mode enabled</div>}
      {config.enableEmailVerification && <button>Verify Email</button>}
    </div>
  )
}
```

### Using Public Config in Server Components

```tsx
import { usePublicConfig } from '@/lib/config'

export default function ServerComponent() {
  const config = usePublicConfig()
  
  return <div>App: {config.appName}</div>
}
```

### Using Private Config in Server Code

```tsx
// server/routes/auth.ts
import { config } from '@/lib/config'

export async function POST(req: Request) {
  // Access private config directly
  const apiKey = config.apiKey // ✅ Safe - server-side only
  const baseUrl = config.apiBaseUrl
  
  // ... use config values
}
```

### Using Private Config in API Routes

```tsx
// app/api/example/route.ts
import { config } from '@/lib/config'

export async function GET() {
  // Private config is safe here
  return Response.json({
    message: 'API endpoint',
    // Don't expose config.apiKey or other sensitive values
  })
}
```

## Provider Setup

The `PublicConfigProvider` is already set up in `app/providers.tsx`:

```tsx
import { PublicConfigProvider } from '@/lib/config/providers'

export function Providers({ children }) {
  return (
    <PublicConfigProvider>
      {/* Other providers */}
      {children}
    </PublicConfigProvider>
  )
}
```

## Environment Variables

### Public Variables (Client-Safe)
Prefix with `NEXT_PUBLIC_` to expose to client:

```bash
NEXT_PUBLIC_APP_NAME=Roll a Bowl
NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION=true
NEXT_PUBLIC_DEBUG_MODE=false
```

### Private Variables (Server-Only)
No prefix - these are never exposed to client:

```bash
API_BASE_URL=http://localhost:3000
API_KEY=your-secret-key
SESSION_COOKIE_NAME=auth-session
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never put sensitive values (API keys, secrets, passwords) in `public/config.ts`
- Never use `NEXT_PUBLIC_` prefix for sensitive values
- Private config should only be imported in server-side code
- All values in `public/config.ts` are bundled into the client JavaScript bundle

## Type Safety

Both configs are fully typed:

```typescript
import type { ClientConfig } from '@/lib/config' // Public config type
import type { EnvironmentConfig } from '@/lib/config' // Private config type
```

