# Testing Teacher Authentication Fix

## Quick Verification Steps

### 1. Start Backend Server
```bash
cd Accellence_server
npm run dev
```

### 2. Test Teacher Endpoints (Use Postman/Thunder Client)

#### Get Teacher Profile
```http
GET http://localhost:5000/api/teachers/me/profile
Authorization: Bearer <TEACHER_JWT_TOKEN>
```

**Expected**: 200 OK with teacher profile data

#### Get Teacher Courses
```http
GET http://localhost:5000/api/teachers/me/courses
Authorization: Bearer <TEACHER_JWT_TOKEN>
```

**Expected**: 200 OK with array of courses assigned to teacher

#### Get Teacher Students
```http
GET http://localhost:5000/api/teachers/me/students
Authorization: Bearer <TEACHER_JWT_TOKEN>
```

**Expected**: 200 OK with array of students enrolled in teacher's courses

### 3. Test Frontend

#### Start Frontend
```bash
cd Excellence_Academy
npm run dev
```

#### Login as Teacher
1. Navigate to `http://localhost:3000/login`
2. Login with teacher credentials
3. Should redirect to `/dashboard/teacher`

#### Verify Dashboard Loads
- No "Access denied" error
- Displays "Teacher Overview" heading
- Shows metrics: Assigned Courses, Total Students, Notices
- Lists courses in "My Courses" section
- Shows recent notices for teachers

### 4. Verify Admin Still Works

#### Login as Admin
1. Navigate to `http://localhost:3000/login`
2. Login with admin credentials
3. Should redirect to `/dashboard/admin`

#### Verify Admin Dashboard
- Shows admin stats (students, teachers, courses, enrollments)
- Can manage teachers from admin panel
- Can create/delete teachers

## Test with cURL

### Get Teacher Profile
```bash
curl -X GET http://localhost:5000/api/teachers/me/profile \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### Get Teacher Courses
```bash
curl -X GET http://localhost:5000/api/teachers/me/courses \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### Get Teacher Students
```bash
curl -X GET http://localhost:5000/api/teachers/me/students \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

## Expected Errors (Negative Tests)

### Teacher trying to access admin endpoints
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```
**Expected**: 403 Forbidden - "Access denied. This route requires one of the following roles: ADMIN"

### Student trying to access teacher endpoints
```bash
curl -X GET http://localhost:5000/api/teachers/me/profile \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```
**Expected**: 403 Forbidden - "Access denied. This route requires one of the following roles: TEACHER"

## Seed Data Verification

Check if you have teacher accounts seeded:
```bash
cd Accellence_server
npx prisma studio
```

1. Open `User` table
2. Filter by `role = TEACHER`
3. Note the email addresses
4. Use these credentials to login and test

If no teachers exist, check `prisma/seed.ts` and run:
```bash
npx prisma db seed
```
