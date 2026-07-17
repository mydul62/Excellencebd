-- Check all users and their roles
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.phone,
  CASE 
    WHEN a.id IS NOT NULL THEN 'Has Admin Profile'
    WHEN t.id IS NOT NULL THEN 'Has Teacher Profile'
    WHEN s.id IS NOT NULL THEN 'Has Student Profile'
    ELSE 'No Profile'
  END as profile_type,
  a.id as admin_profile_id,
  t.id as teacher_profile_id,
  t.subject as teacher_subject,
  s.id as student_profile_id
FROM "User" u
LEFT JOIN "Admin" a ON a."userId" = u.id
LEFT JOIN "Teacher" t ON t."userId" = u.id
LEFT JOIN "Student" s ON s."userId" = u.id
ORDER BY 
  CASE u.role
    WHEN 'ADMIN' THEN 1
    WHEN 'TEACHER' THEN 2
    WHEN 'STUDENT' THEN 3
  END,
  u.name;

-- Count by role
SELECT 
  role,
  COUNT(*) as count
FROM "User"
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'ADMIN' THEN 1
    WHEN 'TEACHER' THEN 2
    WHEN 'STUDENT' THEN 3
  END;

-- Check for users without matching profile
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  CASE 
    WHEN u.role = 'ADMIN' AND a.id IS NULL THEN 'Missing Admin Profile'
    WHEN u.role = 'TEACHER' AND t.id IS NULL THEN 'Missing Teacher Profile'
    WHEN u.role = 'STUDENT' AND s.id IS NULL THEN 'Missing Student Profile'
    ELSE 'OK'
  END as status
FROM "User" u
LEFT JOIN "Admin" a ON a."userId" = u.id
LEFT JOIN "Teacher" t ON t."userId" = u.id
LEFT JOIN "Student" s ON s."userId" = u.id
WHERE 
  (u.role = 'ADMIN' AND a.id IS NULL) OR
  (u.role = 'TEACHER' AND t.id IS NULL) OR
  (u.role = 'STUDENT' AND s.id IS NULL);
