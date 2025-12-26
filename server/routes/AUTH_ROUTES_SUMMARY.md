# Auth Routes Update Summary

The Express authentication routes have been updated to use the Result-based auth client with typed exception handling.

## Key Changes

### 1. Result-Based Error Handling

**Before (Exception-based):**
```typescript
try {
  loginResponse = await authClient.login({ email, password })
} catch (error: any) {
  const userMessage = mapBackendError(error)
  return res.status(401).json({
    success: false,
    error: userMessage,
  })
}
```

**After (Result-based):**
```typescript
const loginResult = await authClient.login({ email, password })

if (!loginResult.ok) {
  const { statusCode, message } = handleLoginError(loginResult.error)
  return res.status(statusCode).json({
    success: false,
    error: message,
  })
}

// Success case
const loginResponse = loginResult.value
```

### 2. Type-Safe Error Handling

Added `handleLoginError()` function that maps the `LoginError` union type to appropriate HTTP responses:

```typescript
function handleLoginError(error: LoginError): { statusCode: number; message: string } {
  if (error instanceof InvalidCredentialsError) {
    return {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Invalid email or password',
    }
  }

  if (error instanceof TooManyLoginAttemptsError) {
    return {
      statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
      message: 'Too many login attempts. Please try again later',
    }
  }

  // ... other error types
}
```

### 3. HTTP Status Code Enum

Replaced magic numbers with the `HttpStatusCode` enum:

```typescript
// Before
return res.status(401).json({ ... })
return res.status(400).json({ ... })
return res.status(500).json({ ... })

// After
return res.status(HttpStatusCode.UNAUTHORIZED).json({ ... })
return res.status(HttpStatusCode.BAD_REQUEST).json({ ... })
return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ ... })
```

## Updated Routes

### POST `/api/auth/login`

- Uses `authClient.login()` which returns `Result<LoginResponse, LoginError>`
- Handles all possible login errors exhaustively
- Maps each error type to appropriate HTTP status code
- No try-catch needed for auth client call

**Error Handling:**
- `InvalidCredentialsError` → 401 Unauthorized
- `InvalidEmailError` → 400 Bad Request
- `InvalidPasswordError` → 400 Bad Request
- `TooManyLoginAttemptsError` → 429 Too Many Requests
- `InternalServerErrorException` → 500 Internal Server Error

### GET `/api/auth/me`

- Uses `HttpStatusCode` enum for status codes
- Consistent error response format

### POST `/api/auth/logout`

- Uses `HttpStatusCode` enum for status codes
- Fixed logout cookie creation to match `SessionCookie` type

## Benefits

1. **Type Safety**: TypeScript knows exactly which errors can occur
2. **No Try-Catch**: Auth client doesn't throw, returns Result
3. **Explicit Error Handling**: All error cases are visible in code
4. **Better HTTP Responses**: Each error maps to correct status code
5. **Maintainability**: Easy to add new error types

## Error Response Format

All error responses follow this format:

```typescript
interface ErrorResponseBody {
  success: false
  error: string        // User-friendly message
  message?: string     // Optional detailed message (for debugging)
}
```

## Example Flow

```typescript
// 1. Validate request
if (!validation.valid) {
  return res.status(HttpStatusCode.BAD_REQUEST).json({
    success: false,
    error: validation.error,
  })
}

// 2. Call auth client (returns Result)
const loginResult = await authClient.login({ email, password })

// 3. Handle error case
if (!loginResult.ok) {
  // TypeScript knows loginResult.error is LoginError union type
  const { statusCode, message } = handleLoginError(loginResult.error)
  return res.status(statusCode).json({
    success: false,
    error: message,
  })
}

// 4. Handle success case
const loginResponse = loginResult.value  // TypeScript knows this is LoginResponse
// ... create session, return response
```

## Testing

The Result-based approach makes testing easier:

```typescript
// Mock successful login
jest.spyOn(authClient, 'login').mockResolvedValue(
  ok({
    success: true,
    token: 'test-token',
    expiresAt: '2024-01-01',
    user: { ... }
  })
)

// Mock specific error
jest.spyOn(authClient, 'login').mockResolvedValue(
  err(new InvalidCredentialsError())
)

// Test route handles error correctly
const response = await request(app)
  .post('/api/auth/login')
  .send({ email, password })

expect(response.status).toBe(401)
expect(response.body.error).toBe('Invalid email or password')
```

## Migration Notes

- No breaking changes to API endpoints
- Response format remains the same
- Error messages improved for clarity
- HTTP status codes now correctly match error types
