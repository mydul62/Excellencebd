import type { Notice } from '@/types'

export const notices: Notice[] = [
  {
    id: 'n1',
    title: 'Eid Holiday Notice',
    content:
      'The coaching center will remain closed from June 15 to June 20 on the occasion of Eid-ul-Adha. Classes will resume as usual afterwards. We wish everyone a joyful celebration.',
    category: 'general',
    audience: 'all',
    date: '2024-05-25',
    author: 'Admin Office',
  },
  {
    id: 'n2',
    title: 'Weekly Test Routine Published',
    content:
      'The routine for this week\u2019s subject-wise tests has been published. Students are advised to check their respective course pages and prepare accordingly.',
    category: 'exam',
    audience: 'students',
    date: '2024-05-24',
    author: 'Exam Committee',
  },
  {
    id: 'n3',
    title: 'New Batch Starting Soon',
    content:
      'Admissions for the new Web Development and Spoken English batches are now open. Limited seats available. Register early to secure your spot.',
    category: 'event',
    audience: 'all',
    date: '2024-05-20',
    author: 'Admission Cell',
  },
  {
    id: 'n4',
    title: 'Class Test on Chapter 5',
    content:
      'A class test covering Chapter 5 (Newtonian Mechanics) will be held this Friday for all Physics students. Please bring your calculators.',
    category: 'exam',
    audience: 'students',
    date: '2024-05-25',
    author: 'Nayeem Hasan',
  },
  {
    id: 'n5',
    title: 'Assignment Submission Deadline',
    content:
      'All Web Development students must submit their portfolio project assignment by May 30. Late submissions will not be accepted.',
    category: 'general',
    audience: 'students',
    date: '2024-05-23',
    author: 'Arif Hossain',
  },
  {
    id: 'n6',
    title: 'Teacher Meeting Scheduled',
    content:
      'A monthly coordination meeting for all teachers is scheduled for May 28 at 4:00 PM in the main conference room. Attendance is mandatory.',
    category: 'general',
    audience: 'teachers',
    date: '2024-05-22',
    author: 'Admin Office',
  },
  {
    id: 'n7',
    title: 'Model Test Results Announced',
    content:
      'The results of the HSC model test have been published. Students can collect their marksheets from the front desk or view them on their dashboard.',
    category: 'exam',
    audience: 'students',
    date: '2024-05-18',
    author: 'Exam Committee',
  },
  {
    id: 'n8',
    title: 'Annual Science Fair',
    content:
      'Bright Future is hosting its Annual Science Fair on June 25. Students from Physics, Chemistry, and Biology courses are encouraged to participate.',
    category: 'event',
    audience: 'all',
    date: '2024-05-15',
    author: 'Event Committee',
  },
  {
    id: 'n9',
    title: 'Fee Payment Reminder',
    content:
      'Students with pending or partial fees are requested to clear their dues by the end of this month to avoid interruption in class access.',
    category: 'urgent',
    audience: 'students',
    date: '2024-05-12',
    author: 'Accounts Office',
  },
  {
    id: 'n10',
    title: 'Library Access Extended',
    content:
      'The center library will now stay open until 8:00 PM on weekdays to support students preparing for upcoming examinations.',
    category: 'general',
    audience: 'all',
    date: '2024-05-10',
    author: 'Admin Office',
  },
]
