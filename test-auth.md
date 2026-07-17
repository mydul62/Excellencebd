# Authentication & Authorization Testing Guide

## ✅ Changes Made

### Backend Changes:
1. **Auth Middleware Enhanced** (`src/app/middleWares/auth.ts`)
   - Added detailed error messages for different scenarios
   - Shows required roles when permission is denied
   - Better token expiration/invalid handling

2. **Auth Controller Updated** (`src/modules/auth/auth.controller.ts`)
   - Login response now includes `accessToken` and `refreshToken` in response body
   - Register response now includes `accessToken` in response body
   - Tokens still set as httpOnly cookies for security

### Frontend Changes:
1. **API Helper Enhanced** (`serverdata/api.ts`)
   - Added token management functions: `getAccessToken()`, `setAccessToken()`, `removeAccessToken()`
   - Automatically adds `Authorization: Bearer <token>` header to all requests
   - Clears token on 401 errors
   - Still sends cookies with `credentials: 'include'`

2. **Auth Hook Updated** (`hooks/use-auth.tsx`)
   - Stores access token in localStorage after login/register
   - Removes token on logout
   - Updated response types to include tokens

## 🧪 Testing Steps

### 1. Test Admin Login & Teacher Access
```bash
# Start backend server
cd Accellence_server
npm run dev

# In another terminal, start frontend
cd Excellence_Academy
npm run dev
```

### 2. Login as Admin
- Email: `admin@example.com`
- Password: `Admin@12345`

### 3. Test Teacher Routes (Admin Access)

**Browser Console Test:**
```javascript
// Get current token
const token = localStorage.getItem('bf_access_token');
console.log('Token:', token);

// Test: Get all teachers (should work - public route)
fetch('http://localhost:5000/api/teachers')
  .then(r => r.json())
  .then(console.log);

// Test: Create teacher (should work for ADMIN)
fetch('http://localhost:5000/api/teachers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Test Teacher',
    email: 'testteacher@demo.com',
    password: 'Test@123456',
    subject: 'Computer Science',
    bio: 'Test bio',
    experienceYears: 5,
    qualification: 'MSc Computer Science'
  })
})
  .then(r => r.json())
  .then(console.log);
```

### 4. Test Teacher Login
- Email: `rafiq@demo.com`
- Password: `Demo@123456`

### 5. Test Teacher Own Profile Access

**Browser Console Test:**
```javascript
const token = localStorage.getItem('bf_access_token');

// Test: Get own profile (should work for TEACHER)
fetch('http://localhost:5000/api/teachers/me/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(console.log);

// Test: Try to create teacher (should fail - ADMIN only)
fetch('http://localhost:5000/api/teachers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Another Teacher',
    email: 'another@demo.com',
    password: 'Test@123456',
    subject: 'Biology'
  })
})
  .then(r => r.json())
  .then(console.log);
// Expected: "Access denied. This route requires one of the following roles: ADMIN. Your role: TEACHER"
```

### 6. Test Student Login & Blocked Access
- Register new student or use existing: `user1@example.com` / `User@12345`

**Browser Console Test:**
```javascript
const token = localStorage.getItem('bf_access_token');

// Test: Try to access teacher profile (should fail)
fetch('http://localhost:5000/api/teachers/me/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(console.log);
// Expected: "Access denied. This route requires one of the following roles: TEACHER. Your role: STUDENT"
```

## 📝 Expected Error Messages

### Before Fix:
```json
{
  "success": false,
  "message": "You are forbidden"
}
```

### After Fix:
```json
{
  "success": false,
  "message": "Access denied. This route requires one of the following roles: ADMIN, TEACHER. Your role: STUDENT"
}
```

## 🔐 Teacher Routes Authorization Matrix

| Route | Method | Public | STUDENT | TEACHER | ADMIN |
|-------|--------|--------|---------|---------|-------|
| `/api/teachers` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/teachers/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/teachers/me/profile` | GET | ❌ | ❌ | ✅ | ❌ |
| `/api/teachers` | POST | ❌ | ❌ | ❌ | ✅ |
| `/api/teachers/:id` | PUT | ❌ | ❌ | ✅* | ✅ |
| `/api/teachers/:id` | DELETE | ❌ | ❌ | ❌ | ✅ |

*TEACHER can only update their own profile

## 🐛 Common Issues & Solutions

### Issue 1: Still getting 403 after login
**Solution:** Clear localStorage and cookies, then login again
```javascript
localStorage.clear();
// Then refresh page and login
```

### Issue 2: Token not being sent
**Check:**
```javascript
// Should return a JWT token
localStorage.getItem('bf_access_token');

// Check network tab - Authorization header should be present
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issue 3: CORS errors
**Backend Fix:** Check `app.ts` has proper CORS configuration
```typescript
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
```

### Issue 4: Token expired
**Frontend handles automatically:**
- 401 error clears token
- User needs to login again

## 🔄 Database Reset (if needed)

```bash
cd Accellence_server

# Reset database
npx prisma migrate reset --force

# Run seed
npx prisma db seed
```

## ✅ Success Indicators

1. **Login Success:**
   - Access token stored in localStorage
   - User redirected to dashboard
   - No console errors

2. **Protected Route Access:**
   - Admin can create/delete teachers
   - Teacher can view own profile
   - Student blocked from teacher routes with clear message

3. **Token Refresh:**
   - Token automatically sent with every request
   - Cleared on logout
   - Cleared on 401 errors

## 📞 Testing Checklist

- [ ] Admin can login
- [ ] Admin can access `/api/teachers` POST endpoint
- [ ] Admin can access `/api/teachers/:id` PUT endpoint
- [ ] Admin can access `/api/teachers/:id` DELETE endpoint
- [ ] Teacher can login
- [ ] Teacher can access `/api/teachers/me/profile` GET endpoint
- [ ] Teacher can update own profile via `/api/teachers/:id` PUT
- [ ] Teacher blocked from creating teachers with clear message
- [ ] Student can login
- [ ] Student blocked from teacher routes with clear message
- [ ] Public can view teacher list `/api/teachers` GET
- [ ] Error messages are descriptive and helpful
- [ ] Token persists across page refreshes
- [ ] Logout clears token properly
