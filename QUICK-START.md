# 🚀 Quick Start - Test Authentication Fix

## ⚡ Fast Track (5 minutes)

### Step 1: Start Servers

**Terminal 1 - Backend:**
```bash
cd Accellence_server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Excellence_Academy
npm run dev
```

### Step 2: Clear Browser Storage
Open browser console (F12) and run:
```javascript
localStorage.clear();
```
Then refresh the page.

### Step 3: Test Login & Teacher Access

#### 🧪 Test 1: Login as Admin
1. Go to login page
2. Login with:
   - Email: `admin@example.com`
   - Password: `Admin@12345`
3. Open browser console (F12)
4. Check token is stored:
```javascript
console.log('Token:', localStorage.getItem('bf_access_token'));
```

#### 🧪 Test 2: Access Teacher Profile (As Admin)
```javascript
// In browser console
const token = localStorage.getItem('bf_access_token');

// Should FAIL with clear error (Admin doesn't have teacher profile)
fetch('http://localhost:5000/api/teachers/me/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

#### 🧪 Test 3: Create Teacher (As Admin)
```javascript
// In browser console
const token = localStorage.getItem('bf_access_token');

// Should WORK (Admin can create teachers)
fetch('http://localhost:5000/api/teachers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Test Teacher',
    email: 'testteacher@demo.com',
    password: 'Teacher@123456',
    subject: 'Computer Science',
    bio: 'Test bio',
    experienceYears: 5,
    qualification: 'MSc CS'
  })
})
.then(r => r.json())
.then(console.log);
```

#### 🧪 Test 4: Login as Teacher
1. Logout current user
2. Login with:
   - Email: `rafiq@demo.com`
   - Password: `Demo@123456`

#### 🧪 Test 5: Get Own Teacher Profile
```javascript
// In browser console
const token = localStorage.getItem('bf_access_token');

// Should WORK (Teacher accessing own profile)
fetch('http://localhost:5000/api/teachers/me/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Success!', data);
  console.log('Teacher:', data.data.user.name);
  console.log('Subject:', data.data.subject);
});
```

#### 🧪 Test 6: Try to Create Teacher (As Teacher)
```javascript
// In browser console
const token = localStorage.getItem('bf_access_token');

// Should FAIL with clear error message
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
    subject: 'Math'
  })
})
.then(r => r.json())
.then(data => {
  console.log('❌ Expected failure:', data);
  console.log('Message should say: "Access denied. This route requires... ADMIN. Your role: TEACHER"');
});
```

## ✅ Success Indicators

### 1. Token is Stored
```javascript
localStorage.getItem('bf_access_token')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Authorization Header is Sent
Check Network tab in DevTools:
- Click on any API request
- Look in "Headers" section
- Should see: `Authorization: Bearer eyJhbGc...`

### 3. Error Messages are Clear
**Before Fix:**
```json
{ "success": false, "message": "You are forbidden" }
```

**After Fix:**
```json
{
  "success": false,
  "message": "Access denied. This route requires one of the following roles: ADMIN. Your role: TEACHER"
}
```

## 🐛 If Something Goes Wrong

### Problem: "Authentication required" error
**Solution:**
1. Check token exists:
```javascript
localStorage.getItem('bf_access_token')
```
2. If null, login again
3. If exists but still failing, token might be invalid - login again

### Problem: "Access denied" error
**Solution:**
This is EXPECTED for wrong roles! Check:
- Admin trying to access `/teachers/me/profile` → ❌ (needs teacher profile)
- Teacher trying to POST `/teachers` → ❌ (needs admin role)
- Student trying to access teacher routes → ❌ (needs teacher/admin role)

### Problem: Token not in localStorage
**Solution:**
1. Check login response includes token:
```javascript
// Login should return
{
  "data": {
    "user": {...},
    "accessToken": "eyJ..."
  }
}
```
2. If not, backend might not be running latest code - restart backend

### Problem: CORS errors
**Solution:**
1. Check backend console for CORS warnings
2. Verify frontend URL is `http://localhost:3000`
3. Backend already configured for this URL

## 📊 Test Results Checklist

Run through each test and check off:

- [ ] Admin can login successfully
- [ ] Token is stored in localStorage
- [ ] Token is sent in Authorization header
- [ ] Admin can create teachers
- [ ] Admin can view all teachers
- [ ] Admin can delete teachers
- [ ] Teacher can login successfully
- [ ] Teacher can view own profile via `/me/profile`
- [ ] Teacher can update own profile
- [ ] Teacher is blocked from creating teachers (with clear message)
- [ ] Student can login successfully
- [ ] Student is blocked from teacher routes (with clear message)
- [ ] Public can view teacher list without authentication
- [ ] Logout clears token from localStorage
- [ ] Error messages are descriptive

## 🎯 Expected Test Outcomes

| User | Action | Expected Result |
|------|--------|----------------|
| **Admin** | POST /teachers | ✅ Success |
| **Admin** | GET /teachers/me/profile | ❌ "Teacher profile not found" |
| **Admin** | DELETE /teachers/:id | ✅ Success |
| **Teacher** | GET /teachers/me/profile | ✅ Success |
| **Teacher** | POST /teachers | ❌ "Access denied... ADMIN. Your role: TEACHER" |
| **Teacher** | PUT /teachers/:ownId | ✅ Success |
| **Teacher** | PUT /teachers/:otherId | ❌ "You can only update your own profile" |
| **Student** | GET /teachers/me/profile | ❌ "Access denied... TEACHER. Your role: STUDENT" |
| **Student** | POST /teachers | ❌ "Access denied... ADMIN. Your role: STUDENT" |
| **Public** | GET /teachers | ✅ Success (no auth required) |
| **No Auth** | POST /teachers | ❌ "Authentication required..." |

## 📝 Notes

1. **All tests should be run in order** for best results
2. **Clear localStorage** between different user logins
3. **Check Network tab** to verify Authorization header is present
4. **Read error messages carefully** - they now tell you exactly what's wrong
5. **Backend and Frontend must both be running** on correct ports

## 🎉 Done!

If all tests pass, your authentication and authorization is working perfectly! 🎊

For detailed debugging, see:
- `test-auth.md` - Comprehensive testing guide
- `AUTH-FIX-SUMMARY.md` - Complete technical documentation
- `test-endpoints.http` - REST Client test cases
