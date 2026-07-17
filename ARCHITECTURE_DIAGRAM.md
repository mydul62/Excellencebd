# Teacher Dashboard Architecture - Before & After

## BEFORE (Problem)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Teacher Page │  │ Admin Page   │  │ Student Page │
    └──────────────┘  └──────────────┘  └──────────────┘
           │                  │                  │
           │ getTeacherDashboard()  getAdminStats()  getStudentDashboard()
           ▼                  ▼                  ▼
    ┌─────────────────────────────────────────────────────────────┐
    │              services/index.ts                               │
    │                                                              │
    │  getTeacherDashboard():                                     │
    │    - apiGetUsers({ role: 'STUDENT' }) ❌ ADMIN ONLY         │
    │    - apiGetTeachers({ limit: 1 })                           │
    │    - apiGetCourses({ limit: 100 })                          │
    │    - apiGetEnrollments({ limit: 200 }) ❌ ADMIN ONLY        │
    └─────────────────────────────────────────────────────────────┘
                               │
                               ▼
    ┌─────────────────────────────────────────────────────────────┐
    │              Backend (Express.js)                           │
    │                                                              │
    │  GET /api/users          → auth(ADMIN) ❌                   │
    │  GET /api/enrollments    → auth(ADMIN) ❌                   │
    │  GET /api/teachers       → public ✓                         │
    │  GET /api/courses        → public ✓                         │
    └─────────────────────────────────────────────────────────────┘

RESULT: Teacher gets 403 Forbidden error when accessing dashboard
```

## AFTER (Solution)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Teacher Page │  │ Admin Page   │  │ Student Page │
    └──────────────┘  └──────────────┘  └──────────────┘
           │                  │                  │
           │                  │                  │
           ▼                  ▼                  ▼
    ┌──────────────────────────────────────────────────────────────┐
    │              services/index.ts                                │
    │                                                               │
    │  getTeacherDashboard():              getAdminStats():        │
    │    - apiGetMyTeacherProfile() ✓        - apiGetUsers()       │
    │    - apiGetMyCourses() ✓               - apiGetEnrollments() │
    │    - apiGetMyStudents() ✓              - apiGetTeachers()    │
    │    - apiGetNotices() ✓                 - apiGetCourses()     │
    └──────────────────────────────────────────────────────────────┘
           │                                          │
           │                                          │
           ▼                                          ▼
    ┌──────────────────────────┐      ┌──────────────────────────┐
    │  Teacher-Specific APIs   │      │    Admin-Only APIs       │
    │                          │      │                          │
    │  GET /teachers/me/       │      │  GET /api/users          │
    │    profile               │      │  POST /api/teachers      │
    │                          │      │  DELETE /api/teachers/:id│
    │  GET /teachers/me/       │      │  GET /api/enrollments    │
    │    courses               │      │  PATCH /courses/:id/     │
    │                          │      │    assign-teacher        │
    │  GET /teachers/me/       │      └──────────────────────────┘
    │    students              │               ▲
    │                          │               │
    │  auth(TEACHER) ✓         │      auth(ADMIN) required
    └──────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────────────────────────────────┐
    │         Backend Services (Prisma)                           │
    │                                                              │
    │  getTeacherCoursesFromDb(teacherId):                        │
    │    - prisma.course.findMany({ where: { teacherId } })       │
    │                                                              │
    │  getTeacherStudentsFromDb(teacherId):                       │
    │    1. Get teacher's courses                                 │
    │    2. Get enrollments for those courses                     │
    │    3. Aggregate unique students                             │
    └─────────────────────────────────────────────────────────────┘

RESULT: Teacher successfully accesses dashboard with proper data
```

## API Authorization Matrix

```
┌────────────────────────────┬──────────┬──────────┬─────────┐
│         Endpoint           │  ADMIN   │ TEACHER  │ STUDENT │
├────────────────────────────┼──────────┼──────────┼─────────┤
│ GET /api/users             │    ✓     │    ✗     │    ✗    │
│ GET /api/users/:id         │    ✓     │  ✓ (own) │ ✓ (own) │
├────────────────────────────┼──────────┼──────────┼─────────┤
│ GET /api/teachers          │    ✓     │    ✓     │    ✓    │
│ GET /api/teachers/:id      │    ✓     │    ✓     │    ✓    │
│ GET /api/teachers/me/      │          │          │         │
│     profile                │    ✗     │    ✓     │    ✗    │
│ GET /api/teachers/me/      │          │          │         │
│     courses                │    ✗     │    ✓     │    ✗    │
│ GET /api/teachers/me/      │          │          │         │
│     students               │    ✗     │    ✓     │    ✗    │
│ POST /api/teachers         │    ✓     │    ✗     │    ✗    │
│ PUT /api/teachers/:id      │    ✓     │  ✓ (own) │    ✗    │
│ DELETE /api/teachers/:id   │    ✓     │    ✗     │    ✗    │
├────────────────────────────┼──────────┼──────────┼─────────┤
│ GET /api/courses           │    ✓     │    ✓     │    ✓    │
│ GET /api/courses/:id       │    ✓     │    ✓     │    ✓    │
│ POST /api/courses          │    ✓     │    ✗     │    ✗    │
│ PUT /api/courses/:id       │    ✓     │    ✗     │    ✗    │
│ DELETE /api/courses/:id    │    ✓     │    ✗     │    ✗    │
│ PATCH /courses/:id/        │          │          │         │
│     assign-teacher         │    ✓     │    ✗     │    ✗    │
├────────────────────────────┼──────────┼──────────┼─────────┤
│ GET /api/enrollments       │    ✓     │    ✗     │    ✗    │
│ GET /api/enrollments/mine  │    ✓     │    ✓     │    ✓    │
│ GET /api/enrollments/:id   │    ✓     │    ✓     │ ✓ (own) │
│ POST /api/enrollments      │    ✓     │    ✗     │    ✓    │
│ PATCH /enrollments/:id/    │          │          │         │
│     approve                │    ✓     │    ✗     │    ✗    │
│ PATCH /enrollments/:id/    │          │          │         │
│     reject                 │    ✓     │    ✗     │    ✗    │
├────────────────────────────┼──────────┼──────────┼─────────┤
│ GET /api/students          │    ✓     │    ✗     │    ✗    │
│ GET /api/students/:id      │    ✓     │    ✓     │ ✓ (own) │
│ POST /api/students         │    ✓     │    ✗     │    ✗    │
│ PUT /api/students/:id      │    ✓     │    ✗     │ ✓ (own) │
│ DELETE /api/students/:id   │    ✓     │    ✗     │    ✗    │
└────────────────────────────┴──────────┴──────────┴─────────┘

Legend:
  ✓ = Allowed
  ✗ = Denied (403 Forbidden)
  ✓ (own) = Allowed only for own resource
```

## Data Flow - Teacher Dashboard

```
1. User Login (TEACHER role)
   ↓
2. JWT Token Generated
   { id: "user-uuid", role: "TEACHER", email: "teacher@example.com" }
   ↓
3. Frontend: getTeacherDashboard(userId)
   ↓
4. API Call: GET /api/teachers/me/profile
   Headers: { Authorization: "Bearer <JWT>" }
   ↓
5. Backend: auth(Role.TEACHER) middleware
   - Verify JWT token
   - Extract userId from token
   - Check role === TEACHER ✓
   ↓
6. Controller: getMyProfile()
   - Extract userId from req.user
   - Call TeacherService.getTeacherByUserIdFromDb(userId)
   ↓
7. Service: getTeacherByUserIdFromDb()
   - prisma.teacher.findFirst({ where: { userId } })
   - Returns teacher profile with courses
   ↓
8. API Call: GET /api/teachers/me/courses
   ↓
9. Service: getTeacherCoursesFromDb(teacherId)
   - prisma.course.findMany({ where: { teacherId } })
   - Returns courses with teacher and enrollment details
   ↓
10. API Call: GET /api/teachers/me/students
    ↓
11. Service: getTeacherStudentsFromDb(teacherId)
    - Get all courses for teacher
    - Get all enrollments for those courses
    - Aggregate unique students
    - Returns student list with enrollment details
    ↓
12. Frontend: Render Dashboard
    - Display courses count
    - Display students count
    - Display courses table
    - Display notices
```

## Security Benefits

1. **Backend Authorization**: Every request validated by auth middleware
2. **Role-Based Access**: Teachers can only access teacher-scoped endpoints
3. **Data Isolation**: Teachers see only their students, not all students
4. **No Client-Side Filtering**: Backend returns filtered data directly
5. **JWT Validation**: All requests require valid, unexpired tokens
6. **Reduced Attack Surface**: Teachers cannot access admin-only endpoints
