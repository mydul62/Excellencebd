# 🧪 Test Teacher Routes - Quick Guide

## ⚡ Quick Test (2 minutes)

### Step 1: Clear Storage & Restart
```bash
# Terminal 1 - Frontend
cd Excellence_Academy
npm run dev
```

Open browser (http://localhost:3000) and:
```javascript
// Press F12, go to Console
localStorage.clear();
```
Refresh page.

### Step 2: Login as Teacher
- Go to: http://localhost:3000/login
- Email: `rafiq@demo.com`
- Password: `Demo@123456`

### Step 3: Test All Teacher Routes

Click through these links in the dashboard sidebar:

- [ ] **ড্যাশবোর্ড** → `/dashboard/teacher` ✅ Should work
- [ ] **আমার কোর্স** → `/dashboard/teacher/courses` ✅ Should work
- [ ] **শিক্ষার্থীরা** → `/dashboard/teacher/students` ✅ Should work
- [ ] **উপস্থিতি** → `/dashboard/teacher/attendance` ✅ Should work
- [ ] **নোটিশ** → `/dashboard/teacher/notices` ✅ Should work
- [ ] **প্রোফাইল** → `/dashboard/teacher/profile` ✅ Should work

### Step 4: Verify Protection Works

**Try to access Admin route:**
1. Manually navigate to: http://localhost:3000/dashboard/admin
2. Expected: ❌ **Redirected back to** `/dashboard/teacher`

**Try to access Student route:**
1. Manually navigate to: http://localhost:3000/dashboard/student
2. Expected: ❌ **Redirected back to** `/dashboard/teacher`

## 🔍 Check Browser Console

You should see logs like:
```
=== MIDDLEWARE DEBUG ===
Path: /dashboard/teacher/courses
Access Token: eyJhbGc...
Decoded Token: { role: "TEACHER", id: "...", email: "..." }
FINAL USER ROLE: TEACHER
✅ Access granted to: /dashboard/teacher/courses
========================
```

## ✅ Success Indicators

### 1. No "Access denied" Errors
Previously you saw:
```
❌ Access denied. This route requires one of the following roles: ADMIN. Your role: TEACHER
```

Now you should see:
```
✅ Page loads successfully with teacher data
```

### 2. Console Logs Show Correct Role
```
FINAL USER ROLE: TEACHER
✅ Access granted to: /dashboard/teacher/courses
```

### 3. All Teacher Pages Load
- Dashboard shows teacher stats
- Courses page shows "আমার কোর্স" (My Courses)
- Profile shows teacher information
- No error messages or redirects

## 🐛 If Still Not Working

### Check 1: Is Token in Cookie?
```javascript
// In browser console
document.cookie
// Should include: bf_access_token=eyJ...
```

### Check 2: What's in the Token?
```javascript
// In browser console
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(window.atob(base64));
}

const cookies = document.cookie.split(';');
const tokenCookie = cookies.find(c => c.includes('bf_access_token'));
if (tokenCookie) {
  const token = tokenCookie.split('=')[1];
  console.log('Decoded:', parseJwt(token));
}
```

Expected output:
```json
{
  "id": "uuid-here",
  "name": "Dr. Rafiqul Islam",
  "email": "rafiq@demo.com",
  "role": "TEACHER",  // ← Must be uppercase!
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Check 3: Middleware Logs
Look at the **terminal running the frontend** (not browser console).

You should see:
```
=== MIDDLEWARE DEBUG ===
Path: /dashboard/teacher/courses
FINAL USER ROLE: TEACHER
✅ Access granted to: /dashboard/teacher/courses
========================
```

If you see:
```
❌ Access denied. User role: undefined
```
→ Token is not being read from cookie. Try logging in again.

If you see:
```
❌ Access denied. User role: teacher  // lowercase!
```
→ Backend is sending lowercase role (bug in backend). Check auth service.

### Check 4: Clear Everything and Restart
```javascript
// Browser console
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

Then:
1. Close browser completely
2. Restart frontend dev server
3. Open fresh browser window
4. Login again

## 📊 Expected Results Table

| Route | Teacher Access | Admin Access | Student Access |
|-------|----------------|--------------|----------------|
| `/dashboard/teacher` | ✅ Works | ❌ Redirect | ❌ Redirect |
| `/dashboard/teacher/courses` | ✅ Works | ❌ Redirect | ❌ Redirect |
| `/dashboard/teacher/profile` | ✅ Works | ❌ Redirect | ❌ Redirect |
| `/dashboard/admin` | ❌ Redirect | ✅ Works | ❌ Redirect |
| `/dashboard/student` | ❌ Redirect | ❌ Redirect | ✅ Works |

## 🎯 Common Issues & Solutions

### Issue 1: "Access denied" still showing
**Cause:** Old token with wrong role format in cookie
**Solution:** 
```bash
# Clear cookie and login again
localStorage.clear();
# Refresh page, then login
```

### Issue 2: Page redirects immediately
**Cause:** Middleware not recognizing role
**Solution:** Check terminal logs for middleware debug info

### Issue 3: "Teacher profile not found" error
**Cause:** User has TEACHER role but no Teacher profile in database
**Solution:** 
```bash
cd Accellence_server
# Check database
npx prisma studio
# Look at Teacher table, verify user has a teacher profile
```

If missing, run seed:
```bash
npx prisma db seed
```

## ✅ Verification Checklist

- [ ] Logged in as Teacher successfully
- [ ] Can access `/dashboard/teacher`
- [ ] Can access `/dashboard/teacher/courses`
- [ ] Can access `/dashboard/teacher/students`
- [ ] Can access `/dashboard/teacher/attendance`
- [ ] Can access `/dashboard/teacher/notices`
- [ ] Can access `/dashboard/teacher/profile`
- [ ] Cannot access `/dashboard/admin` (gets redirected)
- [ ] Cannot access `/dashboard/student` (gets redirected)
- [ ] Console logs show correct role: `TEACHER`
- [ ] No "Access denied" errors appear
- [ ] All pages load without errors

## 🎉 Success!

If all checkboxes are checked, your teacher routes are working perfectly!

### What Was Fixed:
1. ✅ Middleware now correctly recognizes uppercase roles (`TEACHER`)
2. ✅ Type definitions align with backend JWT format
3. ✅ Route protection works correctly
4. ✅ Detailed debugging logs added

### Files Modified:
- `Excellence_Academy/middleware.ts` - Fixed role type definitions

See `MIDDLEWARE-FIX.md` for technical details.
