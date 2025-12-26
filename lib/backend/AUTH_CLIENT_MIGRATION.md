# Auth Client Migration Guide

The auth client has been updated to use the `Result<T, E>` type pattern for explicit error handling. This provides **type-safe, enumerated error handling** without throwing exceptions.

## Key Changes

### Before (Exception-based)
```typescript
try {
  const response = await authClient.login({ email, password })
  console.log('Logged in:', response.user)
} catch (error) {
  // error is unknown type - must type guard or cast
  console.error('Login failed:', error)
}
```

### After (Result-based)
```typescript
const result = await authClient.login({ email, password })

if (result.ok) {
  // TypeScript knows result.value is LoginResponse
  console.log('Logged in:', result.value.user)
} else {
  // TypeScript knows all possible error types via union
  if (result.error instanceof InvalidCredentialsError) {
    console.error('Wrong email or password')
  } else if (result.error instanceof TooManyLoginAttemptsError) {
    console.error('Too many attempts')
  }
}
```

## Benefits

1. **Type Safety**: TypeScript knows exactly which errors can occur for each method
2. **Exhaustive Handling**: Union types force you to handle all possible errors
3. **No Try-Catch**: Errors are values, not exceptions
4. **Explicit**: Return type shows both success and error cases
5. **Composable**: Can use functional utilities like `map`, `andThen`, etc.

## Updated Methods

All auth client methods now return `Result<SuccessType, ErrorUnion>`:

### `login()`
```typescript
Promise<Result<LoginResponse, LoginError>>

// Where LoginError is:
type LoginError =
  | InvalidCredentialsError
  | InvalidEmailError
  | InvalidPasswordError
  | TooManyLoginAttemptsError
  | InternalServerErrorException
```

### `signup()`
```typescript
Promise<Result<SignupResponse, SignupError>>

// Where SignupError is:
type SignupError =
  | InvalidEmailError
  | InvalidPasswordError
  | WeakPasswordError
  | EmailAlreadyExistsError
  | InternalServerErrorException
```

### `verifyEmail()`
```typescript
Promise<Result<VerifyEmailResponse, VerifyEmailError>>

// Where VerifyEmailError is:
type VerifyEmailError =
  | TokenInvalidError
  | TokenExpiredError
  | UserNotFoundError
  | InternalServerErrorException
```

### `requestPasswordReset()`
```typescript
Promise<Result<RequestPasswordResetResponse, RequestPasswordResetError>>

// Where RequestPasswordResetError is:
type RequestPasswordResetError =
  | InvalidEmailError
  | UserNotFoundError
  | InternalServerErrorException
```

### `resetPassword()`
```typescript
Promise<Result<ResetPasswordResponse, ResetPasswordError>>

// Where ResetPasswordError is:
type ResetPasswordError =
  | TokenInvalidError
  | TokenExpiredError
  | InvalidPasswordError
  | WeakPasswordError
  | InternalServerErrorException
```

### `getEmailVerificationStatus()`
```typescript
Promise<Result<{ emailVerified: boolean }, EmailVerificationStatusError>>

// Where EmailVerificationStatusError is:
type EmailVerificationStatusError =
  | InvalidEmailError
  | UserNotFoundError
  | InternalServerErrorException
```

## Migration Examples

### Migrating Login Code

**Before:**
```typescript
async function handleLogin(email: string, password: string) {
  try {
    const response = await authClient.login({ email, password })
    setUser(response.user)
    setToken(response.token)
  } catch (error: any) {
    if (error.statusCode === 401) {
      setError('Invalid credentials')
    } else if (error.statusCode === 429) {
      setError('Too many attempts')
    } else {
      setError('Login failed')
    }
  }
}
```

**After:**
```typescript
async function handleLogin(email: string, password: string) {
  const result = await authClient.login({ email, password })

  if (result.ok) {
    setUser(result.value.user)
    setToken(result.value.token)
  } else {
    if (result.error instanceof InvalidCredentialsError) {
      setError('Invalid credentials')
    } else if (result.error instanceof TooManyLoginAttemptsError) {
      setError('Too many attempts')
    } else {
      setError('Login failed')
    }
  }
}
```

### Migrating Signup Code

**Before:**
```typescript
try {
  const response = await authClient.signup({
    email,
    password,
    firstName,
    lastName,
  })
  console.log('Account created')
} catch (error: any) {
  if (error.message.includes('email')) {
    alert('Email already exists')
  } else {
    alert('Signup failed')
  }
}
```

**After:**
```typescript
const result = await authClient.signup({
  email,
  password,
  firstName,
  lastName,
})

if (result.ok) {
  console.log('Account created')
} else {
  if (result.error instanceof EmailAlreadyExistsError) {
    alert('Email already exists')
  } else if (result.error instanceof WeakPasswordError) {
    alert('Password is too weak')
  } else {
    alert('Signup failed')
  }
}
```

## Helper Utilities

### Using Result Type Guards

```typescript
import { isOk, isErr } from '@/lib/common/result'

const result = await authClient.login({ email, password })

if (isOk(result)) {
  // result is Ok<LoginResponse>
  console.log(result.value)
}

if (isErr(result)) {
  // result is Err<LoginError>
  console.error(result.error)
}
```

### Using Result Transformations

```typescript
import { map, andThen } from '@/lib/common/result'

// Map the success value
const userResult = map(loginResult, (data) => data.user)

// Chain async operations
const profileResult = await andThen(loginResult, async (data) => {
  return fetchUserProfile(data.user.id)
})
```

### Generic Error Message Helper

```typescript
function getAuthErrorMessage(error: unknown): string {
  if (error instanceof InvalidCredentialsError) {
    return 'Invalid email or password'
  }
  if (error instanceof TooManyLoginAttemptsError) {
    return 'Too many attempts. Try again later.'
  }
  if (error instanceof EmailAlreadyExistsError) {
    return 'Email already registered'
  }
  // ... other error types
  return 'An unexpected error occurred'
}

// Usage
if (!result.ok) {
  const message = getAuthErrorMessage(result.error)
  alert(message)
}
```

## Best Practices

1. **Always check `result.ok` first**
   ```typescript
   const result = await authClient.login({ email, password })

   if (!result.ok) {
     // Handle error
     return
   }

   // Use result.value safely
   ```

2. **Handle specific errors explicitly**
   ```typescript
   if (result.error instanceof InvalidCredentialsError) {
     // Specific handling
   } else if (result.error instanceof TooManyLoginAttemptsError) {
     // Different handling
   } else {
     // Generic fallback
   }
   ```

3. **Use type guards for narrowing**
   ```typescript
   if (result.ok) {
     // result.value is available
   } else {
     // result.error is available
   }
   ```

4. **Don't unwrap unless necessary**
   ```typescript
   // Avoid this
   const data = unwrap(result) // throws on error

   // Prefer this
   if (result.ok) {
     const data = result.value
   }
   ```

## Testing

Testing is easier with Result types:

```typescript
import { ok, err } from '@/lib/common/result'

// Mock successful response
jest.spyOn(authClient, 'login').mockResolvedValue(
  ok({
    success: true,
    token: 'test-token',
    expiresAt: '2024-01-01',
    user: { id: 1, email: 'test@example.com', ... }
  })
)

// Mock error response
jest.spyOn(authClient, 'login').mockResolvedValue(
  err(new InvalidCredentialsError())
)
```

## See Also

- [auth-client.example.ts](./auth-client.example.ts) - Complete usage examples
- [result.ts](../common/result.ts) - Result type implementation
- [exceptions/](../exceptions/) - All exception types
