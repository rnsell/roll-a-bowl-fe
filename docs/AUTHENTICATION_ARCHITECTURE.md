# Authentication Architecture

## 🏗️ Overview

This BFF (Backend for Frontend) implements a **two-tier authentication architecture** with complete separation of concerns between Bearer token (API/tenant-level) and User token (user-level) management.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    httpOnly Cookie (Session ID)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js BFF (This App)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐         ┌────────────────────────┐   │
│  │  Session Manager     │         │  API Token Manager     │   │
│  │ (User-level JWT)     │         │ (Bearer Token)         │   │
│  │                      │         │                        │   │
│  │ Stores:              │         │ Features:              │   │
│  │ • userToken          │         │ • Auto-refresh         │   │
│  │ • userId             │         │ • Memory-only          │   │
│  │ • user info          │         │ • Thread-safe          │   │
│  │                      │         │ • 5-min before expiry  │   │
│  └──────────────────────┘         └────────────────────────┘   │
│                                                                  │
│  GraphQL Proxy (/api/graphql)                                  │
│  • Gets Bearer from ApiTokenManager                            │
│  • Gets User token from Session                                │
│  • Validates tenant consistency                                │
│  • Forwards to backend                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Authorization: Bearer <token>
                    X-User-Token: <token>
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Event Directory Backend API                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Layers

### Layer 1: Bearer Token (API/Tenant-Level)

**Purpose**: Authenticate the application to the backend API

**Managed by**: `ApiTokenManager` class in `lib/backend/rest-client.ts`

**Characteristics**:

- ✅ Automatically refreshed before expiry (5-min threshold)
- ✅ Never stored in session
- ✅ Kept in memory only
- ✅ Thread-safe (single refresh in progress)
- ✅ Obtained from API key on demand
- ✅ Never exposed to frontend

**Lifecycle**:

```
Initial Request → ApiTokenManager.getToken()
    ↓
No token? → Exchange API key for Bearer token
    ↓
Expired/Expiring soon? → Refresh with API key
    ↓
Return valid Bearer token
```

**Storage**: Memory only (no session storage)

```javascript
// Get Bearer token (auto-refreshes if needed)
const bearerToken = await tokenManager.getToken(restClient);
```

### Layer 2: User Token (User-Level)

**Purpose**: Identify which user made the request (X-User-Token)

**Managed by**: `SessionManager` class in `lib/session/index.ts`

**Characteristics**:

- ✅ Stored in server-side session
- ✅ Created at login time
- ✅ Tied to session lifecycle
- ✅ Optional in GraphQL requests
- ✅ Used to validate user context
- ✅ Expires when session expires

**Lifecycle**:

```
User Login (/api/auth/login)
    ↓
Backend returns user JWT
    ↓
SessionManager.createSession(userToken)
    ↓
Session stored in server memory
    ↓
Session cookie sent to browser
    ↓
On each request: Session ID extracted from cookie
    ↓
Session lookup: Get user token
    ↓
Use in GraphQL requests as X-User-Token
```

**Storage**: Server-side session (memory, Redis, or database)

```javascript
// Session data structure
{
  id: "sess_...",
  userId: 123,
  userToken: "eyJhbGc...",      // User JWT
  userTokenExpiresAt: Date,
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  emailVerified: true,
  createdAt: Date,
  lastAccessedAt: Date
}

// NOTE: Bearer token is NOT stored here
```

---

## 🔄 Request Flow

### 1. User Login Flow

```
POST /api/auth/login
├─ Request body: { email, password }
├─ REST Client calls backend: /auth/login
├─ Backend returns: { token (user JWT), expiresAt, user }
├─ SessionManager.createSession({
│   userToken: response.token,      // ← Stored in session
│   userTokenExpiresAt: response.expiresAt
│ })
├─ Set httpOnly session cookie
└─ Return user data to frontend
```

### 2. GraphQL Query Flow

```
POST /api/graphql
├─ Browser sends request with httpOnly cookie
├─ Middleware validates session
├─ GraphQL route extracts auth tokens:
│  ├─ Get session ID from cookie
│  ├─ Lookup session → get userToken
│  └─ Get Bearer token from ApiTokenManager
│     └─ If expired: auto-refresh with API key
├─ Validate tenant consistency (Bearer ⊕ User tenantIds match)
├─ Prepare headers:
│  ├─ Authorization: Bearer <auto-refreshed-token>
│  └─ X-User-Token: <user-token-from-session>
├─ Forward to backend GraphQL
└─ Return response to frontend
```

### 3. Auto-Refresh Mechanism

```
GraphQL request arrives
├─ Get Bearer token from ApiTokenManager
├─ Check: token exists & not expiring?
├─ YES: Return cached token
├─ NO: Refresh
│   ├─ Check: already refreshing?
│   ├─ YES: Wait for other refresh
│   ├─ NO: Exchange API key for new token
│   ├─ Store new token & expiry
│   └─ Return new token
└─ Add to Authorization header
```

**Why this design?**

- 🎯 Multiple requests won't trigger multiple refresh calls
- 🎯 Seamless token refresh without user interruption
- 🎯 No session storage complexity
- 🎯 Always have valid token ready

---

## 📋 Key Files

### Core Authentication

| File                          | Purpose                                 |
| ----------------------------- | --------------------------------------- |
| `lib/backend/rest-client.ts`  | REST client + `ApiTokenManager` class   |
| `lib/session/index.ts`        | Session storage + user token management |
| `middleware.ts`               | Session validation, route protection    |
| `app/api/auth/login/route.ts` | User login endpoint                     |
| `app/api/graphql/route.ts`    | GraphQL proxy with auth                 |

### Configuration

| File                       | Purpose               |
| -------------------------- | --------------------- |
| `lib/config/env.ts`        | Environment variables |
| `lib/config/api-client.ts` | API URLs and settings |
| `lib/config/session.ts`    | Session configuration |

---

## 🔑 Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.example.com
API_KEY=sk_live_xxxxx              # Tenant/App API key

# Session Configuration
SESSION_STORAGE=memory             # memory, redis, database
SESSION_EXPIRY_MS=3600000          # 1 hour
SESSION_REFRESH_THRESHOLD_MS=300000 # 5 minutes

# Other
LOG_LEVEL=debug
```

---

## 🚀 How It Works

### Scenario: User logs in and makes a GraphQL query

**Step 1: User fills login form**

```javascript
// Frontend calls
POST /api/auth/login
{ email: "user@example.com", password: "..." }
```

**Step 2: Server creates session**

```javascript
// Backend receives user JWT, creates session
sessionManager.createSession({
  userId: 123,
  userToken: "eyJhbGc...",  // User JWT from backend
  userTokenExpiresAt: future_date
})

// Returns session cookie to browser
Set-Cookie: session_id=sess_xxx; HttpOnly; Secure
```

**Step 3: Frontend makes GraphQL query**

```javascript
// Frontend sends query with session cookie
POST /api/graphql
Cookie: session_id=sess_xxx

// Server-side:
// 1. Extract session ID from cookie
// 2. Lookup session → get userToken
// 3. Get Bearer token from ApiTokenManager
//    - Is token valid? If yes, use it
//    - If no/expiring? Refresh with API key
// 4. Forward to backend with both tokens
Authorization: Bearer <refreshed-token>
X-User-Token: eyJhbGc...
```

**Step 4: Backend validates and returns data**

```javascript
// Backend validates both tokens
// Confirms user is authenticated to correct tenant
// Returns GraphQL response
```

---

## ✅ Security Features

### Bearer Token Security

- ✅ Never exposed to frontend (server-side only)
- ✅ Auto-refreshed before expiry
- ✅ Never stored in session (simplifies rotation)
- ✅ Extracted from API key on demand
- ✅ Thread-safe refresh mechanism

### User Token Security

- ✅ Stored in httpOnly cookie (XSS protection)
- ✅ Secure flag enabled (HTTPS only)
- ✅ SameSite policy (CSRF protection)
- ✅ Expires with session
- ✅ Validated on each request

### Session Security

- ✅ Server-side session validation
- ✅ Protected routes via middleware
- ✅ Automatic cleanup on logout
- ✅ Tenant consistency validation
- ✅ Error messages don't leak info

---

## 🔄 Token Refresh Strategy

### Bearer Token Refresh (Automatic)

- **Threshold**: Refresh 5 minutes before expiry
- **Trigger**: When `getToken()` is called
- **Method**: Exchange API key for new token
- **Result**: Cached and returned immediately

### User Token Refresh (Manual)

- **Option**: Could implement but not required
- **Current**: Session expires when user token expires
- **Alternative**: Use API key exchange to refresh
- **Future**: Can implement if needed

---

## 🚨 Error Scenarios

### Bearer Token Expired

```
GraphQL request → ApiTokenManager.getToken()
→ Token expired → Refresh with API key
→ New token obtained → Continue request
```

✅ **Handled automatically**

### User Token Expired

```
GraphQL request → SessionManager.getSession()
→ User token expired → Session deleted
→ Return 401 Unauthorized
→ Frontend redirects to login
```

✅ **Handled by session validation**

### Tenant ID Mismatch

```
Bearer token tenantId=1
User token tenantId=2
→ Validate consistency check fails
→ Return 401 Unauthorized
→ Prevents cross-tenant access
```

✅ **Prevented by validation**

### API Key Invalid

```
Bearer token refresh → Exchange API key
→ API key invalid → Error
→ Stop request, return 500 or 401
→ Log for monitoring
```

✅ **Caught and logged**

---

## 📊 Comparison: Old vs New Architecture

### Old Architecture ❌

```
Session Storage:
  id: "sess_xxx"
  token: "eyJhbGc..."        ← Bearer token stored
  expiresAt: Date            ← Can't easily refresh

Problems:
- Bearer token in session storage
- Complex refresh logic in middleware
- Token leak if session storage compromised
- Hard to implement auto-refresh
```

### New Architecture ✅

```
Session Storage:
  id: "sess_xxx"
  userId: 123
  userToken: "eyJhbGc..."    ← Only user token
  userTokenExpiresAt: Date

ApiTokenManager (Memory):
  token: "eyJhbGc..."        ← Bearer token
  expiresAt: Date            ← Auto-refreshes

Benefits:
- Bearer token never stored
- Seamless auto-refresh
- Session storage simplification
- Better security separation
```

---

## 🎯 Key Takeaways

1. **Two Independent Managers**

   - `ApiTokenManager`: Bearer token (API key exchange)
   - `SessionManager`: User token (from login)

2. **No Cross-Contamination**

   - Bearer token ≠ Session storage
   - Auto-refresh independent of user session
   - Logout only clears user session

3. **Request Headers**

   - Always: `Authorization: Bearer <token>`
   - Optional: `X-User-Token: <token>`
   - Both handled at GraphQL endpoint

4. **Auto-Refresh**

   - Bearer token: Transparent, on-demand
   - User token: Expires with session

5. **Security First**
   - No tokens exposed to frontend
   - Tenant validation on each request
   - Session cleanup on logout
