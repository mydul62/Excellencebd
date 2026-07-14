import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const pw = await bcrypt.hash('Demo@123456', 10);

  // ─── Admin ────────────────────────────────────────────────────────────────
  const adminEmail = 'admin@demo.com';
  let admin = await prisma.user.findFirst({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: await bcrypt.hash('Admin@123456', 10),
        role: 'ADMIN',
        phone: '+880 1711 000000',
        avatar: 'https://i.pravatar.cc/150?img=68',
        adminProfile: {
          create: {}
        },
        profile: {
          create: {
            address: 'Dhaka, Bangladesh',
            gender: 'Male',
            dateOfBirth: '1990-01-01',
            bloodGroup: 'O+',
            emergencyContact: '+880 1711 000001',
          }
        }
      },
    });
    console.log('✅ Admin created:', adminEmail);
  } else {
    // Ensure relations exist even if admin user existed from a previous run
    let adminProf = await prisma.admin.findFirst({ where: { userId: admin.id } });
    if (!adminProf) {
      await prisma.admin.create({ data: { userId: admin.id } });
    }
    let prof = await prisma.profile.findFirst({ where: { userId: admin.id } });
    if (!prof) {
      await prisma.profile.create({
        data: {
          userId: admin.id,
          address: 'Dhaka, Bangladesh',
          gender: 'Male',
          dateOfBirth: '1990-01-01',
          bloodGroup: 'O+',
          emergencyContact: '+880 1711 000001',
        }
      });
    }
    console.log('⏭  Admin already exists');
  }

  // ─── Teachers ─────────────────────────────────────────────────────────────
  const teacherData = [
    {
      name: 'Dr. Rafiqul Islam',
      email: 'rafiq@demo.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
      phone: '+880 1811 000001',
      subject: 'Mathematics',
      bio: 'Expert in advanced mathematics with 12 years of teaching experience.',
      experienceYears: 12,
      qualification: 'PhD Mathematics, BUET',
    },
    {
      name: 'Farida Khanam',
      email: 'farida@demo.com',
      avatar: 'https://i.pravatar.cc/150?img=47',
      phone: '+880 1811 000002',
      subject: 'Physics',
      bio: 'Passionate physics educator helping students grasp fundamental concepts.',
      experienceYears: 8,
      qualification: 'MSc Physics, DU',
    },
    {
      name: 'Md. Karim Uddin',
      email: 'karim@demo.com',
      avatar: 'https://i.pravatar.cc/150?img=33',
      phone: '+880 1811 000003',
      subject: 'Chemistry',
      bio: 'Chemistry specialist with focus on practical lab-based learning.',
      experienceYears: 10,
      qualification: 'MSc Chemistry, CUET',
    },
    {
      name: 'Nasrin Akter',
      email: 'nasrin@demo.com',
      avatar: 'https://i.pravatar.cc/150?img=56',
      phone: '+880 1811 000004',
      subject: 'English',
      bio: 'English language and literature teacher with a focus on communication skills.',
      experienceYears: 6,
      qualification: 'MA English, JU',
    },
  ];

  const teachers: any[] = [];
  for (const t of teacherData) {
    let user = await prisma.user.findFirst({ where: { email: t.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: t.name, email: t.email, password: pw, role: 'TEACHER', avatar: t.avatar, phone: t.phone },
      });
    }
    let teacher = await prisma.teacher.findFirst({ where: { userId: user.id } });
    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          subject: t.subject,
          bio: t.bio,
          experienceYears: t.experienceYears,
          qualification: t.qualification,
          department: 'Science & Arts',
          designation: 'Lecturer',
        },
      });
      console.log('✅ Teacher created:', t.name);
    }
    let profile = await prisma.profile.findFirst({ where: { userId: user.id } });
    if (!profile) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          address: 'Dhaka, Bangladesh',
          gender: 'Male',
          dateOfBirth: '1985-05-15',
          bloodGroup: 'A+',
          emergencyContact: '+880 1811 000000',
          department: 'Science & Arts',
          subject: t.subject,
          designation: 'Lecturer',
        }
      });
    }
    teachers.push({ ...teacher, user });
  }

  // ─── Courses ──────────────────────────────────────────────────────────────
  const courseData = [
    {
      title: 'SSC Mathematics',
      slug: 'ssc-mathematics',
      category: 'Academic',
      description: 'Complete SSC mathematics preparation covering algebra, geometry, and trigonometry.',
      duration: '6 months',
      price: 3500,
      level: 'Beginner' as const,
      icon: 'calculator',
      seats: 30,
      rating: 4.8,
      popular: true,
      teacherIdx: 0,
    },
    {
      title: 'HSC Physics',
      slug: 'hsc-physics',
      category: 'Academic',
      description: 'In-depth HSC physics with conceptual understanding and problem-solving strategies.',
      duration: '8 months',
      price: 4500,
      level: 'Intermediate' as const,
      icon: 'zap',
      seats: 25,
      rating: 4.7,
      popular: true,
      teacherIdx: 1,
    },
    {
      title: 'Chemistry Foundation',
      slug: 'chemistry-foundation',
      category: 'Academic',
      description: 'Build a strong foundation in chemistry for SSC and HSC students.',
      duration: '5 months',
      price: 3000,
      level: 'Beginner' as const,
      icon: 'flask-conical',
      seats: 30,
      rating: 4.6,
      popular: false,
      teacherIdx: 2,
    },
    {
      title: 'Spoken English',
      slug: 'spoken-english',
      category: 'Language',
      description: 'Improve your spoken English for academic and professional settings.',
      duration: '3 months',
      price: 2500,
      level: 'Beginner' as const,
      icon: 'message-circle',
      seats: 20,
      rating: 4.9,
      popular: true,
      teacherIdx: 3,
    },
    {
      title: 'Advanced Mathematics',
      slug: 'advanced-mathematics',
      category: 'Academic',
      description: 'Advanced topics for competitive exam and university admission preparation.',
      duration: '4 months',
      price: 5000,
      level: 'Advanced' as const,
      icon: 'sigma',
      seats: 15,
      rating: 4.5,
      popular: false,
      teacherIdx: 0,
    },
    {
      title: 'Science Skills',
      slug: 'science-skills',
      category: 'Science',
      description: 'Integrated science course covering physics, chemistry and biology basics.',
      duration: '4 months',
      price: 3200,
      level: 'Intermediate' as const,
      icon: 'microscope',
      seats: 25,
      rating: 4.4,
      popular: false,
      teacherIdx: 2,
    },
  ];

  const courses: any[] = [];
  for (const c of courseData) {
    let course = await prisma.course.findFirst({ where: { slug: c.slug } });
    if (!course) {
      course = await prisma.course.create({
        data: {
          title: c.title,
          slug: c.slug,
          category: c.category,
          description: c.description,
          duration: c.duration,
          price: c.price,
          level: c.level,
          icon: c.icon,
          seats: c.seats,
          rating: c.rating,
          popular: c.popular,
          teacherId: teachers[c.teacherIdx].id,
        },
      });
      console.log('✅ Course created:', c.title);
    }
    courses.push(course);
  }

  // ─── Students ─────────────────────────────────────────────────────────────
  const studentData = [
    { name: 'Rahim Ahmed', email: 'rahim@demo.com', phone: '+880 1911 000001', avatar: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Sumaiya Begum', email: 'sumaiya@demo.com', phone: '+880 1911 000002', avatar: 'https://i.pravatar.cc/150?img=48' },
    { name: 'Tanvir Hossain', email: 'tanvir@demo.com', phone: '+880 1911 000003', avatar: 'https://i.pravatar.cc/150?img=7' },
    { name: 'Nadia Islam', email: 'nadia@demo.com', phone: '+880 1911 000004', avatar: 'https://i.pravatar.cc/150?img=45' },
    { name: 'Arif Rahman', email: 'arif@demo.com', phone: '+880 1911 000005', avatar: 'https://i.pravatar.cc/150?img=11' },
  ];

  const students: any[] = [];
  for (const s of studentData) {
    let user = await prisma.user.findFirst({ where: { email: s.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: s.name, email: s.email, password: pw, role: 'STUDENT', avatar: s.avatar, phone: s.phone },
      });
      console.log('✅ Student created:', s.name);
    }
    let student = await prisma.student.findFirst({ where: { userId: user.id } });
    if (!student) {
      await prisma.student.create({
        data: {
          userId: user.id,
          guardian: 'M. Rahman',
          address: 'Dhaka, Bangladesh',
          status: 'active',
        }
      });
    }
    let profile = await prisma.profile.findFirst({ where: { userId: user.id } });
    if (!profile) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          address: 'Dhaka, Bangladesh',
          gender: 'Male',
          dateOfBirth: '2002-08-20',
          bloodGroup: 'B+',
          emergencyContact: '+880 1911 000000',
          department: 'General',
          subject: 'All',
        }
      });
    }
    students.push(user);
  }

  // ─── Enrollments ──────────────────────────────────────────────────────────
  const enrollmentData = [
    { studentIdx: 0, courseIdx: 0, status: 'approved' as const, paymentStatus: 'paid' as const, amountPaid: 3500, paymentMethod: 'bkash', transactionId: 'BK001' },
    { studentIdx: 0, courseIdx: 3, status: 'approved' as const, paymentStatus: 'partial' as const, amountPaid: 1500, paymentMethod: 'nagad', transactionId: 'NG001' },
    { studentIdx: 1, courseIdx: 1, status: 'approved' as const, paymentStatus: 'paid' as const, amountPaid: 4500, paymentMethod: 'bkash', transactionId: 'BK002' },
    { studentIdx: 2, courseIdx: 0, status: 'pending' as const, paymentStatus: 'unpaid' as const, amountPaid: 0, paymentMethod: 'bkash', transactionId: 'BK003' },
    { studentIdx: 3, courseIdx: 2, status: 'approved' as const, paymentStatus: 'paid' as const, amountPaid: 3000, paymentMethod: 'rocket', transactionId: 'RK001' },
    { studentIdx: 4, courseIdx: 4, status: 'pending' as const, paymentStatus: 'unpaid' as const, amountPaid: 0, paymentMethod: 'bank', transactionId: 'BNK001' },
    { studentIdx: 1, courseIdx: 3, status: 'approved' as const, paymentStatus: 'paid' as const, amountPaid: 2500, paymentMethod: 'bkash', transactionId: 'BK004' },
    { studentIdx: 3, courseIdx: 5, status: 'approved' as const, paymentStatus: 'partial' as const, amountPaid: 2000, paymentMethod: 'nagad', transactionId: 'NG002' },
  ];

  for (const e of enrollmentData) {
    const student = students[e.studentIdx];
    const course = courses[e.courseIdx];
    const existing = await prisma.enrollment.findFirst({
      where: { userId: student.id, courseId: course.id },
    });
    if (!existing) {
      await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          paymentMethod: e.paymentMethod,
          transactionId: e.transactionId,
          status: e.status,
          paymentStatus: e.paymentStatus,
          amountPaid: e.amountPaid,
        },
      });
      console.log(`✅ Enrollment: ${student.name} → ${course.title}`);
    }
  }

  // ─── Notices ──────────────────────────────────────────────────────────────
  const noticeData = [
    { title: 'Eid Holiday Notice', content: 'The academy will remain closed from 29 March to 5 April for Eid-ul-Fitr. Classes will resume on 6 April.', category: 'holiday' as const, audience: 'all' as const, author: 'Admin' },
    { title: 'Mid-term Exam Schedule', content: 'Mid-term exams will be held from 15 to 20 April. Students must carry their ID cards.', category: 'exam' as const, audience: 'students' as const, author: 'Admin' },
    { title: 'New Batch Enrollment Open', content: 'Enrollment for the July batch is now open for all courses. Limited seats available.', category: 'general' as const, audience: 'all' as const, author: 'Admin' },
    { title: 'Teachers Meeting', content: 'All teachers are requested to attend the monthly meeting on 10 April at 3 PM.', category: 'general' as const, audience: 'teachers' as const, author: 'Admin' },
    { title: 'Annual Sports Day', content: 'Annual sports day will be held on 25 April. All students are encouraged to participate.', category: 'event' as const, audience: 'students' as const, author: 'Admin' },
    { title: 'Syllabus Update', content: 'Updated syllabus for HSC Physics has been uploaded to the student portal.', category: 'academic' as const, audience: 'students' as const, author: 'Dr. Rafiqul Islam' },
  ];

  for (const n of noticeData) {
    const existing = await prisma.notice.findFirst({ where: { title: n.title } });
    if (!existing) {
      await prisma.notice.create({ data: n });
      console.log('✅ Notice created:', n.title);
    }
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────
  const reviewData = [
    { name: 'Rahim Ahmed', avatar: 'https://i.pravatar.cc/150?img=3', role: 'SSC Student', rating: 5, comment: 'The mathematics course completely transformed my understanding. I scored A+ in my exams!', featured: true },
    { name: 'Sumaiya Begum', avatar: 'https://i.pravatar.cc/150?img=48', role: 'HSC Student', rating: 5, comment: 'The physics teacher explains concepts in a very clear and engaging way. Highly recommended!', featured: true },
    { name: 'Tanvir Hossain', avatar: 'https://i.pravatar.cc/150?img=7', role: 'SSC Student', rating: 4, comment: 'Great teaching methodology. The chemistry course helped me understand reactions practically.', featured: true },
    { name: 'Nadia Islam', avatar: 'https://i.pravatar.cc/150?img=45', role: 'Language Student', rating: 5, comment: 'My spoken English improved dramatically within just two months. The teacher is amazing!', featured: false },
    { name: 'Arif Rahman', avatar: 'https://i.pravatar.cc/150?img=11', role: 'HSC Student', rating: 4, comment: 'Advanced math course is excellent. It prepared me well for university admission tests.', featured: false },
  ];

  for (const r of reviewData) {
    const existing = await prisma.review.findFirst({ where: { name: r.name } });
    if (!existing) {
      await prisma.review.create({ data: r });
      console.log('✅ Review created by:', r.name);
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────');
  console.log('  Admin     → admin@demo.com / Admin@123456');
  console.log('  Teachers  → rafiq@demo.com / Demo@123456');
  console.log('  Students  → rahim@demo.com / Demo@123456');
  console.log('─────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
