# 🧪 Testing Setup Guide

Complete guide for setting up test users and testing the application end-to-end.

---

## 🔐 Default Test Password

**Password**: `DemoPassword123!`

This is the hardcoded password used by the `create-user` CLI command in the backend API.

---

## 👤 Creating Test Users

### Using Backend API CLI Command

The backend API has a CLI command to create test users with random names and tenants.

```bash
# Navigate to backend API directory
cd /Users/robertsell/Code/event-directory-api

# Run the create-user command
npm run cli -- create-user
# OR
bun run cli create-user
```

### What Gets Created

When you run the command, it automatically creates:

1. **Random Tenant**

   - Name: `[Color] [Object] - [timestamp]`
   - Slug: URL-friendly version
   - Status: ACTIVE

2. **Random User**

   - Email: `test-[timestamp]@testing.com`
   - First Name: Random texture word (Silky, Smooth, etc.)
   - Last Name: Random feeling word (Happy, Calm, etc.)
   - Password: `DemoPassword123!`
   - Email Verified: Yes (pre-verified)

3. **API Token**
   - Auto-generated for the tenant
   - Used for Bearer token authentication

### Example Output

```
🚀 Creating user with tenant and API token...

✅ Tenant created successfully!
✅ User created successfully!

═══════════════════════════════════════════════════
📋 USER & TENANT INFORMATION
═══════════════════════════════════════════════════

🏢 TENANT:

  Tenant ID: 123
  Name:      Blue Box - 456789
  Slug:      blue-box-456789
  Status:    ACTIVE

👤 USER:

  User ID:   456
  Email:     test-1699123456@testing.com
  Name:      Smooth Happy
  Status:    ACTIVE
  Verified:  Yes

🔐 LOGIN CREDENTIALS:

  Email:     test-1699123456@testing.com
  Password:  DemoPassword123!

🔑 API TOKEN:

  Token ID:  789
  Name:      Smooth-Happy-api-token
  Token:     abc123def456...
  Status:    ACTIVE

═══════════════════════════════════════════════════
```

---

## 🧪 End-to-End Testing

### Test Flow

```
1. Create a test user (using CLI command above)
   ↓
2. Start the frontend dev server
   ↓
3. Go to http://localhost:3001
   ↓
4. Click "Sign In" → /auth/login
   ↓
5. Enter test user credentials:
   Email:    test-1699123456@testing.com  (from CLI output)
   Password: DemoPassword123!
   ↓
6. Successfully logs in and redirects to /dashboard
   ↓
7. Dashboard displays user profile from GraphQL API
   ↓
8. Verify GraphQL query returns correct user data
```

### URLs to Test

| URL                                 | Purpose         | Expected Result                            |
| ----------------------------------- | --------------- | ------------------------------------------ |
| `http://localhost:3001`             | Home page       | Shows home page with quick start info      |
| `http://localhost:3001/auth/login`  | Login form      | Shows login form                           |
| `http://localhost:3001/dashboard`   | Protected route | Shows user profile (or redirects to login) |
| `http://localhost:3001/auth/logout` | Logout          | Clears session and redirects home          |

---

## 🔑 Manual User Creation (Alternative)

If you need to create users manually instead of using the CLI:

### Via Backend API REST Endpoint

```bash
# Make sure backend is running
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "DemoPassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Via GraphQL Mutation (if available)

```graphql
mutation CreateUser {
  createUser(
    input: {
      email: "user@example.com"
      password: "DemoPassword123!"
      firstName: "John"
      lastName: "Doe"
    }
  ) {
    id
    email
    firstName
    lastName
  }
}
```

---

## 🔍 Debugging Tips

### Check if Backend is Running

```bash
# Should return 200 OK
curl http://localhost:3000/health

# Or check GraphQL endpoint
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

### Check Frontend is Running

```bash
# Should return home page HTML
curl http://localhost:3001
```

### View Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Login and observe requests:
   - `POST /api/auth/login`
   - `POST /api/graphql` (for user profile)
   - Responses should include user data

### Check Browser Storage

1. Open DevTools (F12)
2. Application → Cookies
3. Look for `session` cookie (should be httpOnly)
4. Should not see any JWT tokens in localStorage/sessionStorage

### Enable Debug Logging

Check the browser console for Apollo Client and auth logs:

```typescript
// Already configured in lib/graphql/client.ts
// Logs are output to console with prefixes like:
// [ApolloClient] GraphQL Request
// [AuthProvider] Login successful
```

---

## 🚀 Quick Start Commands

### One-liner Setup

```bash
# In backend directory
cd /Users/robertsell/Code/event-directory-api && \
npm run cli -- create-user && \
echo "✅ User created, now run frontend" && \
cd /Users/robertsell/Code/tenant-fe && \
npm run dev
```

Then:

1. Copy the email and password from the output
2. Go to http://localhost:3001/auth/login
3. Enter the credentials
4. Check the dashboard

---

## 📊 Test Data Schema

### User Fields

| Field         | Type    | Example                     |
| ------------- | ------- | --------------------------- |
| email         | string  | test-1699123456@testing.com |
| password      | string  | DemoPassword123!            |
| firstName     | string  | Smooth                      |
| lastName      | string  | Happy                       |
| emailVerified | boolean | true                        |
| status        | enum    | ACTIVE, INACTIVE, SUSPENDED |

### Tenant Fields

| Field  | Type   | Example                     |
| ------ | ------ | --------------------------- |
| name   | string | Blue Box - 456789           |
| slug   | string | blue-box-456789             |
| status | enum   | ACTIVE, INACTIVE, SUSPENDED |

### API Token Fields

| Field  | Type   | Example                           |
| ------ | ------ | --------------------------------- |
| name   | string | Smooth-Happy-api-token            |
| token  | string | abc123def456... (only shown once) |
| status | enum   | ACTIVE, INACTIVE, REVOKED         |

---

## ⚠️ Important Notes

1. **Password is Hardcoded**: The CLI always uses `DemoPassword123!`

   - This is intentional for development
   - Don't use in production

2. **Email is Random**: Each CLI run generates a new unique email

   - Format: `test-[unix-timestamp]@testing.com`
   - Prevents conflicts between multiple test users

3. **API Token is Private**: The plain token is shown only once

   - Store it somewhere safe during testing
   - Used for Bearer token authentication

4. **Session is Server-Side**:

   - No tokens are stored in browser
   - httpOnly cookies are used
   - JWT stays server-side (in session)

5. **Email Already Verified**:
   - Test users are pre-verified
   - Can login immediately after creation

---

## 🔗 Related Documentation

- **Authentication Architecture**: `docs/AUTHENTICATION_ARCHITECTURE.md`
- **E2E Test URLs**: `docs/QUICK_REFERENCE.md`
- **GraphQL Testing**: `docs/GRAPHQL_SETUP_COMPLETE.md`

---

## 🎯 Common Test Scenarios

### Scenario 1: Fresh User Login

1. Create user with CLI
2. Go to login page
3. Enter email and password
4. Verify redirects to dashboard
5. Check user profile appears

### Scenario 2: Session Persistence

1. Login successfully
2. Refresh page (Ctrl+R)
3. Dashboard should still be visible
4. User data still there (from cookie-stored session)

### Scenario 3: Protected Routes

1. Logout completely
2. Try to access /dashboard directly
3. Should redirect to login

### Scenario 4: Token Refresh

1. Login successfully
2. Keep browser open for 1+ hour
3. Make a GraphQL request
4. Should still work (token auto-refreshed server-side)

### Scenario 5: Multiple Users

1. Create user #1, login, verify
2. Logout
3. Create user #2, login, verify
4. Logout
5. Login with user #1 again, verify still works

---

## 📝 Notes for Team

- Always use `DemoPassword123!` for test users
- Create fresh users for each testing session
- Don't commit real user credentials to repo
- Use test emails with `@testing.com` domain
- Keep API tokens private, don't share in messages

---

**Last Updated**: November 8, 2025
**Status**: ✅ Ready for Testing

