# Logging Strategy

## Overview

The application uses a **universal logging system** that automatically adapts to the environment (server vs client) while maintaining a consistent API.

## Architecture

### Universal Logger (`lib/common/logger.ts`)

The universal logger provides a single interface that works on both server and client:

- **Server**: Uses Pino logger with structured logging (after initialization)
- **Client**: Uses console with formatted output

### Server-Side Logging (`lib/config/logging.ts`)

- Uses Pino for structured, performant logging
- Pretty-printed in development mode
- Must be initialized once during server startup via `initializeLogging()`

### Client-Side Logging

- Uses browser `console` API
- Automatically formats messages with scope and level
- Respects `NEXT_PUBLIC_DEBUG_MODE` environment variable

## Usage

### For Universal Code (Works on Server & Client)

```typescript
import { createLogger } from '@/lib/common/logger'

// Automatically detects environment and uses appropriate logger
const logger = createLogger('MyComponent', debugMode)
logger.info({ data: 'value' }, 'Message')
```

### For Server-Only Code

```typescript
import { createLogger } from '@/lib/config/logging'

// Uses Pino logger (after initialization)
const logger = createLogger('ServerModule')
logger.info({ data: 'value' }, 'Message')
```

### For Client-Only Code

```typescript
import { createLogger } from '@/lib/common/logger'

// Uses console logger
const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
const logger = createLogger('ClientComponent', debugMode)
logger.info({ data: 'value' }, 'Message')
```

## Initialization

The server must initialize the universal logger during startup:

```typescript
// server.ts
import { initializeLogging } from './lib/config/logging'

// Call this once at the start of server initialization
initializeLogging()
```

## Configuration

### Server-Side

Configured via `lib/config/private/config.ts`:
- `LOG_LEVEL`: 'debug' | 'info' | 'warn' | 'error'
- `DEBUG_MODE`: boolean

### Client-Side

Configured via environment variables:
- `NEXT_PUBLIC_DEBUG_MODE`: 'true' | 'false' (enables debug logging)

## Best Practices

1. **Use universal logger for shared code** (like Apollo Client)
   ```typescript
   import { createLogger } from '@/lib/common/logger'
   ```

2. **Use server logger for server-only code**
   ```typescript
   import { createLogger } from '@/lib/config/logging'
   ```

3. **Always pass a meaningful scope** to identify the source of logs

4. **Use structured logging** - pass objects as the first parameter
   ```typescript
   logger.info({ userId: 123, action: 'login' }, 'User logged in')
   ```

5. **Respect log levels**:
   - `debug`: Detailed debugging information (only in debug mode)
   - `info`: General informational messages
   - `warn`: Warning messages for potentially problematic situations
   - `error`: Error messages for failures

## Example: Apollo Client

The Apollo Client uses the universal logger, which automatically:
- Uses Pino on the server (structured, performant)
- Uses console on the client (formatted, readable)
- Respects debug mode from appropriate config source

```typescript
// lib/graphql/client.ts
import { createLogger } from '@/lib/common/logger'

const getDebugMode = (): boolean => {
  if (typeof window === 'undefined') {
    // Server: use private config
    const { config } = require('@/lib/config/private/config')
    return config.debugMode
  }
  // Client: use environment variable
  return process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
}

const logger = createLogger('ApolloClient', getDebugMode())
```

## Migration Guide

If you have existing code using `createLogger` from `@/lib/config/logging`:

1. **Server-only code**: No changes needed, continue using `@/lib/config/logging`
2. **Client code or universal code**: Switch to `@/lib/common/logger`
3. **Apollo Client**: Already updated to use universal logger

