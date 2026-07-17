import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  Role,
  CourseLevel,
  EnrollmentStatus,
  PaymentStatus,
  NoticeCategory,
  NoticeAudience,
} from '@prisma/client';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // ─── Hash helpers ──────────────────────────────────────────────────────────
  const hashPw = (pw: string) => bcrypt.hash(pw, 10);
  const demoPw = await hashPw('Demo@123456');

  // ─── 1. ADMIN ──────────────────────────────────────────────────────────────
  let admin = await prisma.user.findFirst({ where: { email: 'admin@example.com' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@example.com',
        password: await hashPw('Admin@12345'),
        role: Role.ADMIN,
        phone: '+880 1711 000000',
        avatar: 'https://i.pravatar.cc/150?img=68',
        adminProfile: { create: {} },
        profile: {
          create: {
            address: 'Dhaka, Bangladesh',
            gender: 'Male',
            dateOfBirth: '1985-01-15',
            bloodGroup: 'O+',
            emergencyContact: '+880 1711 000001',
            designation: 'System Administrator',
          },
        },
      },
    });
    console.log('✅ Admin created: admin@example.com');
  } else {
    const hasAdminProfile = await prisma.admin.findFirst({ where: { userId: admin.id } });
    if (!hasAdminProfile) await prisma.admin.create({ data: { userId: admin.id } });
    const hasProfile = await prisma.profile.findFirst({ where: { userId: admin.id } });
    if (!hasProfile) {
      await prisma.profile.create({
        data: { userId: admin.id, address: 'Dhaka, Bangladesh', gender: 'Male', dateOfBirth: '1985-01-15', bloodGroup: 'O+', emergencyContact: '+880 1711 000001' },
      });
    }
    console.log('⏭  Admin already exists');
  }

  // ─── 2. REGULAR DEMO USERS (user1/2/3) ────────────────────────────────────
  const demoUserRows = [
    { name: 'Demo User One',   email: 'user1@example.com', password: 'User@12345', avatar: 'https://i.pravatar.cc/150?img=15', phone: '+880 1911 000006' },
    { name: 'Demo User Two',   email: 'user2@example.com', password: 'User@12345', avatar: 'https://i.pravatar.cc/150?img=16', phone: '+880 1911 000007' },
    { name: 'Demo User Three', email: 'user3@example.com', password: 'User@12345', avatar: 'https://i.pravatar.cc/150?img=17', phone: '+880 1911 000008' },
  ];

  const demoUsers: any[] = [];
  for (const u of demoUserRows) {
    let user = await prisma.user.findFirst({ where: { email: u.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: u.name, email: u.email, password: await hashPw(u.password), role: Role.STUDENT, avatar: u.avatar, phone: u.phone },
      });
      console.log(`✅ Demo user created: ${u.email}`);
    } else {
      console.log(`⏭  Demo user exists: ${u.email}`);
    }
    if (!(await prisma.student.findFirst({ where: { userId: user.id } }))) {
      await prisma.student.create({ data: { userId: user.id, guardian: 'Demo Guardian', address: 'Dhaka, Bangladesh', status: 'active' } });
    }
    if (!(await prisma.profile.findFirst({ where: { userId: user.id } }))) {
      await prisma.profile.create({ data: { userId: user.id, address: 'Dhaka, Bangladesh', gender: 'Not specified', dateOfBirth: '2003-06-01', bloodGroup: 'O+', emergencyContact: '+880 1911 000000' } });
    }
    demoUsers.push(user);
  }

  // ─── 3. TEACHERS ──────────────────────────────────────────────────────────
  const teacherRows = [
    { name: 'Dr. Rafiqul Islam', email: 'rafiq@demo.com', avatar: 'https://i.pravatar.cc/150?img=12', phone: '+880 1811 000001', subject: 'Mathematics', bio: 'Expert in advanced mathematics with 12 years of teaching experience.', experienceYears: 12, qualification: 'PhD Mathematics, BUET', department: 'Science', designation: 'Senior Lecturer' },
    { name: 'Farida Khanam',     email: 'farida@demo.com', avatar: 'https://i.pravatar.cc/150?img=47', phone: '+880 1811 000002', subject: 'Physics',     bio: 'Passionate physics educator helping students grasp fundamental concepts.',  experienceYears: 8,  qualification: 'MSc Physics, DU',    department: 'Science', designation: 'Lecturer' },
    { name: 'Md. Karim Uddin',   email: 'karim@demo.com',  avatar: 'https://i.pravatar.cc/150?img=33', phone: '+880 1811 000003', subject: 'Chemistry',   bio: 'Chemistry specialist with focus on practical lab-based learning.',          experienceYears: 10, qualification: 'MSc Chemistry, CUET', department: 'Science', designation: 'Lecturer' },
    { name: 'Nasrin Akter',      email: 'nasrin@demo.com', avatar: 'https://i.pravatar.cc/150?img=56', phone: '+880 1811 000004', subject: 'English',     bio: 'English language teacher focused on communication and writing skills.',     experienceYears: 6,  qualification: 'MA English, JU',      department: 'Arts',   designation: 'Lecturer' },
  ];

  const teachers: any[] = [];
  for (const t of teacherRows) {
    let user = await prisma.user.findFirst({ where: { email: t.email } });
    if (!user) {
      user = await prisma.user.create({ data: { name: t.name, email: t.email, password: demoPw, role: Role.TEACHER, avatar: t.avatar, phone: t.phone } });
    }
    let teacher = await prisma.teacher.findFirst({ where: { userId: user.id } });
    if (!teacher) {
      teacher = await prisma.teacher.create({ data: { userId: user.id, subject: t.subject, bio: t.bio, experienceYears: t.experienceYears, qualification: t.qualification, department: t.department, designation: t.designation } });
      console.log(`✅ Teacher created: ${t.name}`);
    }
    if (!(await prisma.profile.findFirst({ where: { userId: user.id } }))) {
      await prisma.profile.create({ data: { userId: user.id, address: 'Dhaka, Bangladesh', gender: 'Not specified', dateOfBirth: '1985-05-15', bloodGroup: 'A+', emergencyContact: '+880 1811 000000', department: t.department, subject: t.subject, designation: t.designation } });
    }
    teachers.push({ ...teacher, user });
  }

  // ─── 4. COURSES ───────────────────────────────────────────────────────────
  const courseRows = [
    { title: 'SSC Mathematics',    slug: 'ssc-mathematics',    category: 'Academic',  description: 'Complete SSC mathematics covering algebra, geometry, and trigonometry.',        duration: '6 months', price: 3500, level: CourseLevel.Beginner,     icon: 'calculator',    seats: 30, rating: 4.8, popular: true,  tIdx: 0 },
    { title: 'HSC Physics',        slug: 'hsc-physics',        category: 'Academic',  description: 'In-depth HSC physics with conceptual understanding and problem-solving.',       duration: '8 months', price: 4500, level: CourseLevel.Intermediate, icon: 'zap',           seats: 25, rating: 4.7, popular: true,  tIdx: 1 },
    { title: 'Chemistry Foundation',slug:'chemistry-foundation',category: 'Academic',  description: 'Strong foundation in chemistry for SSC and HSC students.',                     duration: '5 months', price: 3000, level: CourseLevel.Beginner,     icon: 'flask-conical', seats: 30, rating: 4.6, popular: false, tIdx: 2 },
    { title: 'Spoken English',     slug: 'spoken-english',     category: 'Language',  description: 'Improve spoken English for academic and professional settings.',               duration: '3 months', price: 2500, level: CourseLevel.Beginner,     icon: 'message-circle',seats: 20, rating: 4.9, popular: true,  tIdx: 3 },
    { title: 'Advanced Mathematics',slug:'advanced-mathematics',category: 'Academic',  description: 'Advanced topics for competitive exam and university admission preparation.',    duration: '4 months', price: 5000, level: CourseLevel.Advanced,      icon: 'sigma',         seats: 15, rating: 4.5, popular: false, tIdx: 0 },
    { title: 'Science Skills',     slug: 'science-skills',     category: 'Science',   description: 'Integrated science covering physics, chemistry and biology basics.',            duration: '4 months', price: 3200, level: CourseLevel.Intermediate, icon: 'microscope',    seats: 25, rating: 4.4, popular: false, tIdx: 2 },
    { title: 'English Grammar',    slug: 'english-grammar',    category: 'Language',  description: 'Comprehensive grammar course for SSC/HSC board exams.',                        duration: '3 months', price: 2000, level: CourseLevel.Beginner,     icon: 'book-open',     seats: 30, rating: 4.3, popular: false, tIdx: 3 },
    { title: 'Biology Basics',     slug: 'biology-basics',     category: 'Academic',  description: 'Foundational biology covering cells, genetics, and ecosystems.',               duration: '5 months', price: 3300, level: CourseLevel.Beginner,     icon: 'leaf',          seats: 25, rating: 4.5, popular: false, tIdx: 1 },
  ];

  const courses: any[] = [];
  for (const c of courseRows) {
    let course = await prisma.course.findFirst({ where: { slug: c.slug } });
    if (!course) {
      course = await prisma.course.create({ data: { title: c.title, slug: c.slug, category: c.category, description: c.description, duration: c.duration, price: c.price, level: c.level, icon: c.icon, seats: c.seats, rating: c.rating, popular: c.popular, teacherId: teachers[c.tIdx].id } });
      console.log(`✅ Course created: ${c.title}`);
    }
    courses.push(course);
  }

  // ─── 5. EXTRA STUDENTS ────────────────────────────────────────────────────
  const studentRows = [
    { name: 'Rahim Ahmed',   email: 'rahim@demo.com',   phone: '+880 1911 000001', avatar: 'https://i.pravatar.cc/150?img=3',  guardian: 'Mr. Ahmed', address: 'Mirpur, Dhaka',   gender: 'Male',   dob: '2005-03-10' },
    { name: 'Sumaiya Begum', email: 'sumaiya@demo.com', phone: '+880 1911 000002', avatar: 'https://i.pravatar.cc/150?img=48', guardian: 'Mr. Islam', address: 'Gulshan, Dhaka',  gender: 'Female', dob: '2004-07-22' },
    { name: 'Tanvir Hossain',email: 'tanvir@demo.com',  phone: '+880 1911 000003', avatar: 'https://i.pravatar.cc/150?img=7',  guardian: 'Mr. Hossain', address: 'Uttara, Dhaka', gender: 'Male',   dob: '2005-11-05' },
    { name: 'Nadia Islam',   email: 'nadia@demo.com',   phone: '+880 1911 000004', avatar: 'https://i.pravatar.cc/150?img=45', guardian: 'Mr. Islam', address: 'Dhanmondi, Dhaka',gender: 'Female', dob: '2004-02-28' },
    { name: 'Arif Rahman',   email: 'arif@demo.com',    phone: '+880 1911 000005', avatar: 'https://i.pravatar.cc/150?img=11', guardian: 'Mr. Rahman', address: 'Mohammadpur, Dhaka', gender: 'Male', dob: '2003-09-14' },
    { name: 'Sabrina Khatun',email: 'sabrina@demo.com', phone: '+880 1911 000009', avatar: 'https://i.pravatar.cc/150?img=44', guardian: 'Mr. Khatun', address: 'Banani, Dhaka', gender: 'Female', dob: '2005-05-18' },
    { name: 'Rakib Hassan',  email: 'rakib@demo.com',   phone: '+880 1911 000010', avatar: 'https://i.pravatar.cc/150?img=19', guardian: 'Mr. Hassan', address: 'Tejgaon, Dhaka', gender: 'Male',  dob: '2004-12-01' },
  ];

  const students: any[] = [...demoUsers];
  for (const s of studentRows) {
    let user = await prisma.user.findFirst({ where: { email: s.email } });
    if (!user) {
      user = await prisma.user.create({ data: { name: s.name, email: s.email, password: demoPw, role: Role.STUDENT, avatar: s.avatar, phone: s.phone } });
      console.log(`✅ Student created: ${s.name}`);
    }
    if (!(await prisma.student.findFirst({ where: { userId: user.id } }))) {
      await prisma.student.create({ data: { userId: user.id, guardian: s.guardian, address: s.address, status: 'active' } });
    }
    if (!(await prisma.profile.findFirst({ where: { userId: user.id } }))) {
      await prisma.profile.create({ data: { userId: user.id, address: s.address, gender: s.gender, dateOfBirth: s.dob, bloodGroup: 'B+', emergencyContact: '+880 1911 000000' } });
    }
    students.push(user);
  }

  // ─── 6. ENROLLMENTS ───────────────────────────────────────────────────────
  // students[0-2] = demoUsers (user1/2/3), students[3+] = extra students
  const enrollmentRows = [
    { sIdx: 0, cIdx: 0, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.paid,    amountPaid: 3500, method: 'bkash',  txId: 'BK001', notes: 'Paid in full' },
    { sIdx: 0, cIdx: 3, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.partial,  amountPaid: 1500, method: 'nagad',  txId: 'NG001', notes: 'Partial payment' },
    { sIdx: 1, cIdx: 1, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.paid,    amountPaid: 4500, method: 'bkash',  txId: 'BK002', notes: null },
    { sIdx: 2, cIdx: 4, status: EnrollmentStatus.pending,   paymentStatus: PaymentStatus.unpaid,   amountPaid: 0,    method: 'bkash',  txId: 'BK003', notes: 'Awaiting payment' },
    { sIdx: 3, cIdx: 0, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.paid,    amountPaid: 3500, method: 'rocket', txId: 'RK001', notes: null },
    { sIdx: 3, cIdx: 3, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.paid,    amountPaid: 2500, method: 'bkash',  txId: 'BK004', notes: null },
    { sIdx: 4, cIdx: 1, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.paid,    amountPaid: 4500, method: 'nagad',  txId: 'NG002', notes: null },
    { sIdx: 5, cIdx: 2, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.paid,    amountPaid: 3000, method: 'bkash',  txId: 'BK005', notes: null },
    { sIdx: 6, cIdx: 5, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.partial,  amountPaid: 2000, method: 'nagad',  txId: 'NG003', notes: 'Remaining due' },
    { sIdx: 7, cIdx: 6, status: EnrollmentStatus.pending,   paymentStatus: PaymentStatus.unpaid,   amountPaid: 0,    method: 'bank',   txId: 'BNK001',notes: null },
    { sIdx: 8, cIdx: 7, status: EnrollmentStatus.approved,  paymentStatus: PaymentStatus.paid,    amountPaid: 3300, method: 'bkash',  txId: 'BK006', notes: null },
    { sIdx: 9, cIdx: 0, status: EnrollmentStatus.rejected,  paymentStatus: PaymentStatus.unpaid,   amountPaid: 0,    method: 'nagad',  txId: 'NG004', notes: 'Insufficient payment proof' },
  ];

  for (const e of enrollmentRows) {
    const student = students[e.sIdx];
    const course = courses[e.cIdx];
    if (!student || !course) continue;
    const exists = await prisma.enrollment.findFirst({ where: { userId: student.id, courseId: course.id } });
    if (!exists) {
      await prisma.enrollment.create({ data: { userId: student.id, courseId: course.id, name: student.name, email: student.email, phone: student.phone ?? 'N/A', paymentMethod: e.method, transactionId: e.txId, notes: e.notes, status: e.status, paymentStatus: e.paymentStatus, amountPaid: e.amountPaid } });
      console.log(`✅ Enrollment: ${student.name} → ${course.title}`);
    }
  }

  // ─── 7. NOTICES ───────────────────────────────────────────────────────────
  const noticeRows = [
    { title: 'Eid Holiday Notice',       content: 'The academy will remain closed from 29 March to 5 April for Eid-ul-Fitr. Classes resume on 6 April.',           category: NoticeCategory.holiday,  audience: NoticeAudience.all,      author: 'System Admin', date: new Date('2026-03-20') },
    { title: 'Mid-term Exam Schedule',   content: 'Mid-term exams will be held from 15 to 20 April. Students must carry their ID cards. No mobiles allowed.',      category: NoticeCategory.exam,     audience: NoticeAudience.students, author: 'System Admin', date: new Date('2026-04-01') },
    { title: 'New Batch Enrollment Open',content: 'Enrollment for the July batch is now open for all courses. Limited seats — register early to secure your spot.', category: NoticeCategory.general,  audience: NoticeAudience.all,      author: 'System Admin', date: new Date('2026-05-15') },
    { title: 'Monthly Teachers Meeting', content: 'All teachers are requested to attend the monthly meeting on 10 April at 3 PM in the conference room.',          category: NoticeCategory.general,  audience: NoticeAudience.teachers, author: 'System Admin', date: new Date('2026-04-05') },
    { title: 'Annual Sports Day',        content: 'Annual sports day will be held on 25 April. All students are encouraged to participate and show team spirit.',   category: NoticeCategory.event,    audience: NoticeAudience.students, author: 'System Admin', date: new Date('2026-04-10') },
    { title: 'HSC Physics Syllabus Update', content: 'Updated syllabus for HSC Physics has been uploaded. Students please review Chapter 9 & 10 additions.',      category: NoticeCategory.academic, audience: NoticeAudience.students, author: 'Dr. Rafiqul Islam', date: new Date('2026-03-10') },
    { title: 'Fee Payment Reminder',     content: 'Last date for June batch fee payment is 30 May. Late payments will incur a 10% surcharge.',                     category: NoticeCategory.general,  audience: NoticeAudience.students, author: 'System Admin', date: new Date('2026-05-20') },
    { title: 'Summer Vacation Schedule', content: 'Summer vacation from 1 to 15 June. Online support sessions continue on weekends.',                              category: NoticeCategory.holiday,  audience: NoticeAudience.all,      author: 'System Admin', date: new Date('2026-05-25') },
  ];

  for (const n of noticeRows) {
    const exists = await prisma.notice.findFirst({ where: { title: n.title } });
    if (!exists) {
      await prisma.notice.create({ data: n });
      console.log(`✅ Notice created: ${n.title}`);
    }
  }

  // ─── 8. REVIEWS ───────────────────────────────────────────────────────────
  const reviewRows = [
    { name: 'Rahim Ahmed',    avatar: 'https://i.pravatar.cc/150?img=3',  role: 'SSC Student',      rating: 5, comment: 'The mathematics course completely transformed my understanding. I scored A+ in my exams!',           featured: true,  cIdx: 0 },
    { name: 'Sumaiya Begum',  avatar: 'https://i.pravatar.cc/150?img=48', role: 'HSC Student',      rating: 5, comment: 'The physics teacher explains concepts in a very clear and engaging way. Highly recommended!',        featured: true,  cIdx: 1 },
    { name: 'Tanvir Hossain', avatar: 'https://i.pravatar.cc/150?img=7',  role: 'SSC Student',      rating: 4, comment: 'Great teaching methodology. The chemistry course helped me understand reactions practically.',       featured: true,  cIdx: 2 },
    { name: 'Nadia Islam',    avatar: 'https://i.pravatar.cc/150?img=45', role: 'Language Student', rating: 5, comment: 'My spoken English improved dramatically within two months. The teacher is absolutely amazing!',     featured: true,  cIdx: 3 },
    { name: 'Arif Rahman',    avatar: 'https://i.pravatar.cc/150?img=11', role: 'HSC Student',      rating: 4, comment: 'Advanced math course is excellent. It prepared me well for university admission tests.',            featured: false, cIdx: 4 },
    { name: 'Sabrina Khatun', avatar: 'https://i.pravatar.cc/150?img=44', role: 'SSC Student',      rating: 5, comment: 'Science Skills course gave me a solid integrated understanding of all core subjects. Loved it!',  featured: false, cIdx: 5 },
    { name: 'Rakib Hassan',   avatar: 'https://i.pravatar.cc/150?img=19', role: 'Language Student', rating: 4, comment: 'English Grammar course is very well-structured. My writing skills improved noticeably.',            featured: false, cIdx: 6 },
    { name: 'Demo User One',  avatar: 'https://i.pravatar.cc/150?img=15', role: 'Student',          rating: 5, comment: 'Excellent academy. The teachers are highly qualified and the study material is top-notch.',         featured: true,  cIdx: 0 },
  ];

  for (const r of reviewRows) {
    const exists = await prisma.review.findFirst({ where: { name: r.name } });
    if (!exists) {
      const userForReview = await prisma.user.findFirst({ where: { name: r.name } });
      await prisma.review.create({ data: { name: r.name, avatar: r.avatar, role: r.role, rating: r.rating, comment: r.comment, featured: r.featured, courseId: courses[r.cIdx]?.id ?? null, userId: userForReview?.id ?? null } });
      console.log(`✅ Review by: ${r.name}`);
    }
  }

  // ─── 9. PHOTO GALLERY ─────────────────────────────────────────────────────
  const galleryRows = [
    { title: 'Annual Prize-Giving Ceremony 2025',   description: 'Students receiving awards at our annual prize-giving ceremony.',      category: 'events',   imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', publicId: 'gallery/prize-giving-2025' },
    { title: 'Science Lab Practical Session',       description: 'Students conducting chemistry experiments in our modern laboratory.',  category: 'academic', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543559c5f185?w=800', publicId: 'gallery/science-lab' },
    { title: 'Sports Day 2025',                     description: 'Exciting track and field events from our annual sports day.',         category: 'sports',   imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800', publicId: 'gallery/sports-day-2025' },
    { title: 'Classroom Learning Session',          description: 'Interactive classroom session with students and teachers.',            category: 'academic', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', publicId: 'gallery/classroom-session' },
    { title: 'Cultural Program 2025',               description: 'Students performing at the annual cultural program.',                  category: 'events',   imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', publicId: 'gallery/cultural-program' },
    { title: 'New Student Orientation',             description: 'Welcome day for new batch students at Excellence Academy.',           category: 'memories', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', publicId: 'gallery/orientation-day' },
    { title: 'Mathematics Competition',             description: 'Inter-batch mathematics olympiad with top performers.',                category: 'academic', imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800', publicId: 'gallery/math-competition' },
    { title: 'Graduation Day 2024',                 description: 'Proud graduates celebrating their academic achievements.',            category: 'events',   imageUrl: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=800', publicId: 'gallery/graduation-2024' },
    { title: 'English Speaking Workshop',           description: 'Students practising public speaking during the English workshop.',    category: 'academic', imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', publicId: 'gallery/english-workshop' },
    { title: 'Library Reading Room',                description: 'Students making great use of our well-stocked library.',             category: 'memories', imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', publicId: 'gallery/library-room' },
    { title: 'Teachers Appreciation Day',           description: 'Students honouring teachers during Teachers Appreciation Day.',       category: 'events',   imageUrl: 'https://images.unsplash.com/photo-1544717301-9cdcb1f5940f?w=800', publicId: 'gallery/teachers-day' },
    { title: 'Physics Lab Experiments',             description: 'Students exploring electricity concepts in the physics lab.',         category: 'academic', imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', publicId: 'gallery/physics-lab' },
  ];

  for (const g of galleryRows) {
    const exists = await prisma.photoGallery.findFirst({ where: { publicId: g.publicId } });
    if (!exists) {
      await prisma.photoGallery.create({ data: g });
      console.log(`✅ Photo added: ${g.title}`);
    }
  }

  // ─── 10. RESULTS ──────────────────────────────────────────────────────────
  // Only for enrolled+approved students
  const resultRows = [
    { sIdx: 3, cIdx: 0, marks: 88, grade: 'A+', remarks: 'Excellent performance', examDate: new Date('2026-04-20') },
    { sIdx: 3, cIdx: 3, marks: 76, grade: 'A',  remarks: 'Good performance',      examDate: new Date('2026-04-22') },
    { sIdx: 4, cIdx: 1, marks: 91, grade: 'A+', remarks: 'Outstanding',           examDate: new Date('2026-04-21') },
    { sIdx: 5, cIdx: 2, marks: 82, grade: 'A+', remarks: 'Very good',             examDate: new Date('2026-04-23') },
    { sIdx: 6, cIdx: 5, marks: 70, grade: 'A',  remarks: 'Good',                  examDate: new Date('2026-04-24') },
    { sIdx: 8, cIdx: 7, marks: 85, grade: 'A+', remarks: 'Excellent',             examDate: new Date('2026-04-25') },
    { sIdx: 0, cIdx: 0, marks: 78, grade: 'A',  remarks: 'Good effort',           examDate: new Date('2026-04-20') },
    { sIdx: 1, cIdx: 1, marks: 93, grade: 'A+', remarks: 'Outstanding work',      examDate: new Date('2026-04-21') },
  ];

  for (const r of resultRows) {
    const student = students[r.sIdx];
    const course = courses[r.cIdx];
    if (!student || !course) continue;
    const exists = await prisma.result.findFirst({ where: { studentId: student.id, courseId: course.id } });
    if (!exists) {
      await prisma.result.create({ data: { studentId: student.id, courseId: course.id, marks: r.marks, grade: r.grade, remarks: r.remarks, examDate: r.examDate } });
      console.log(`✅ Result: ${student.name} in ${course.title} → ${r.grade}`);
    }
  }

  // ─── 11. ATTENDANCE ───────────────────────────────────────────────────────
  // Generate 2 weeks of attendance for approved enrolled students
  const attendanceStudentCourses = [
    { sIdx: 3, cIdx: 0 }, { sIdx: 3, cIdx: 3 },
    { sIdx: 4, cIdx: 1 }, { sIdx: 5, cIdx: 2 },
    { sIdx: 6, cIdx: 5 }, { sIdx: 8, cIdx: 7 },
    { sIdx: 0, cIdx: 0 }, { sIdx: 1, cIdx: 1 },
  ];
  const attendanceStatuses = ['present', 'present', 'present', 'absent', 'present']; // ~80% present

  const startDate = new Date('2026-05-01');
  for (const sc of attendanceStudentCourses) {
    const student = students[sc.sIdx];
    const course = courses[sc.cIdx];
    if (!student || !course) continue;
    for (let day = 0; day < 10; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + day);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
      const status = attendanceStatuses[day % attendanceStatuses.length];
      const exists = await prisma.attendance.findFirst({ where: { studentId: student.id, courseId: course.id, date } });
      if (!exists) {
        await prisma.attendance.create({ data: { studentId: student.id, courseId: course.id, date, status } });
      }
    }
  }
  console.log('✅ Attendance records created');

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  const counts = {
    users:       await prisma.user.count(),
    admins:      await prisma.admin.count(),
    teachers:    await prisma.teacher.count(),
    students:    await prisma.student.count(),
    profiles:    await prisma.profile.count(),
    courses:     await prisma.course.count(),
    enrollments: await prisma.enrollment.count(),
    notices:     await prisma.notice.count(),
    reviews:     await prisma.review.count(),
    gallery:     await prisma.photoGallery.count(),
    results:     await prisma.result.count(),
    attendance:  await prisma.attendance.count(),
  };

  console.log('\n🎉 Seed complete!\n');
  console.log('📊 Records in each table:');
  Object.entries(counts).forEach(([table, count]) => console.log(`   ${table.padEnd(14)} : ${count}`));
  console.log('\n🔐 Login credentials:');
  console.log('   admin@example.com  / Admin@12345  (ADMIN)');
  console.log('   user1@example.com  / User@12345   (STUDENT)');
  console.log('   user2@example.com  / User@12345   (STUDENT)');
  console.log('   user3@example.com  / User@12345   (STUDENT)');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
