# Exception Handling

This directory contains custom exception classes for the application, separated into two categories:

## Exception Types

### 1. HTTP Exceptions ([http.exception.ts](http.exception.ts))

Used in **API routes** and **Express handlers** for HTTP responses. These map directly to HTTP status codes.

**When to use:** In server-side API routes when you need to return an HTTP error response.

```typescript
import { UnauthorizedException, BadRequestException } from '@/lib/exceptions'

// In Express route
router.post('/login', async (req, res) => {
  if (!req.body.email) {
    throw new BadRequestException('Email is required')
  }

  const exception = new UnauthorizedException('Invalid credentials')
  return res.status(exception.statusCode).json(exception.toErrorResponse())
})
```

**Available HTTP Exceptions:**
- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `ConflictException` (409)
- `UnprocessableEntityException` (422)
- `TooManyRequestsException` (429)
- `InternalServerErrorException` (500)
- `BadGatewayException` (502)
- `ServiceUnavailableException` (503)
- `GatewayTimeoutException` (504)

### 2. Service Exceptions ([service.exception.ts](service.exception.ts))

Used in **application logic** and **business rules**. These don't map directly to HTTP status codes.

**When to use:** In services, utilities, hooks, and components for internal error handling.

```typescript
import {
  InvalidCredentialsError,
  SessionNotFoundError,
  InvalidEmailError
} from '@/lib/exceptions'

// In service/business logic
function validateLogin(email: string, password: string) {
  if (!email.includes('@')) {
    throw new InvalidEmailError()
  }

  // ... authentication logic
  if (!valid) {
    throw new InvalidCredentialsError()
  }
}
```

**Available Service Exceptions:**

#### Authentication
- `InvalidCredentialsError`
- `SessionNotFoundError`
- `SessionExpiredError`
- `SessionInvalidError`
- `SessionCreationError`
- `TokenMissingError`
- `TokenInvalidError`
- `TokenExpiredError`
- `TokenRevokedError`
- `TokenRefreshError`

#### User Account
- `UserNotFoundError`
- `EmailNotVerifiedError`
- `AccountLockedError`
- `AccountSuspendedError`
- `AccountDeactivatedError`
- `EmailAlreadyExistsError`

#### Validation
- `ValidationError`
- `InvalidEmailError`
- `InvalidPasswordError`
- `WeakPasswordError`
- `MissingFieldError`

#### Authorization
- `InsufficientPermissionsError`
- `InsufficientRoleError`
- `TenantAccessDeniedError`
- `ResourceAccessDeniedError`

#### Rate Limiting
- `TooManyLoginAttemptsError`
- `TooManyPasswordResetAttemptsError`
- `TooManyVerificationAttemptsError`

## Exception Mapping Utilities ([auth.exception.ts](auth.exception.ts))

Helper functions to convert between exception types.

### `mapServiceToHttpException(error: Error): Error`

Converts service exceptions to HTTP exceptions for API responses.

```typescript
import { mapServiceToHttpException, InvalidCredentialsError } from '@/lib/exceptions'

try {
  // Business logic that throws service exceptions
  authenticateUser(email, password)
} catch (error) {
  // Convert to HTTP exception for API response
  const httpError = mapServiceToHttpException(error)
  return res.status(httpError.statusCode).json(httpError.toErrorResponse())
}
```

### `mapBackendErrorToServiceException(error: any): Error`

Converts backend API errors (with status codes) to service exceptions.

```typescript
import { mapBackendErrorToServiceException } from '@/lib/exceptions'

try {
  await backendApi.login(email, password)
} catch (backendError) {
  // Convert backend error to service exception
  const serviceError = mapBackendErrorToServiceException(backendError)
  throw serviceError
}
```

### `toHttpException(error: Error): Error`

Automatically converts any error to an HTTP exception.

```typescript
import { toHttpException } from '@/lib/exceptions'

try {
  // Any logic
} catch (error) {
  const httpError = toHttpException(error)
  return res.status(httpError.statusCode).json(httpError.toErrorResponse())
}
```

## Usage Patterns

### Pattern 1: Service Layer with HTTP Response

```typescript
// lib/services/auth.service.ts
import { InvalidCredentialsError, SessionCreationError } from '@/lib/exceptions'

export class AuthService {
  async login(email: string, password: string) {
    // Throw service exceptions in business logic
    if (!isValid(email, password)) {
      throw new InvalidCredentialsError()
    }

    const session = await createSession(userId)
    if (!session) {
      throw new SessionCreationError()
    }

    return session
  }
}

// server/routes/auth.ts
import { mapServiceToHttpException } from '@/lib/exceptions'
import { authService } from '@/lib/services/auth.service'

router.post('/login', async (req, res) => {
  try {
    const session = await authService.login(req.body.email, req.body.password)
    return res.json({ success: true, session })
  } catch (error) {
    const httpError = mapServiceToHttpException(error)
    return res.status(httpError.statusCode).json(httpError.toErrorResponse())
  }
})
```

### Pattern 2: Direct HTTP Exceptions in Routes

```typescript
import { BadRequestException, UnauthorizedException } from '@/lib/exceptions'

router.post('/login', async (req, res) => {
  if (!req.body.email) {
    const error = new BadRequestException('Email is required')
    return res.status(error.statusCode).json(error.toErrorResponse())
  }

  // ... login logic
})
```

### Pattern 3: React Hook with Service Exceptions

```typescript
// hooks/useAuth.tsx
import { InvalidCredentialsError, SessionExpiredError } from '@/lib/exceptions'

export function useAuth() {
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        // Map HTTP response to service exception for client-side handling
        throw new InvalidCredentialsError()
      }

      return await response.json()
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        setError('Invalid email or password')
      }
      throw error
    }
  }
}
```

## Type Guards

Check exception types with type guards:

```typescript
import { isHttpException, isServiceException, isAuthServiceError } from '@/lib/exceptions'

if (isHttpException(error)) {
  // It's an HTTP exception
  return res.status(error.statusCode).json(error.toErrorResponse())
}

if (isServiceException(error)) {
  // It's a service exception
  console.log(error.code)
}

if (isAuthServiceError(error)) {
  // It's an auth-related service exception
}
```

## Best Practices

1. **Use service exceptions in business logic** - Keep HTTP concerns out of your services
2. **Map to HTTP exceptions at the route level** - Convert service exceptions to HTTP responses in Express routes
3. **Include metadata** - Pass helpful context in the metadata parameter
4. **Don't expose sensitive info** - Be careful not to leak sensitive data in error messages
5. **Log errors appropriately** - Use the logger with error metadata for debugging

```typescript
import { createLogger } from '@/lib/config/logging'
import { InvalidCredentialsError } from '@/lib/exceptions'

const logger = createLogger('AuthService')

try {
  authenticateUser(email, password)
} catch (error) {
  logger.error({ error, email }, 'Authentication failed')
  throw new InvalidCredentialsError()
}
```
