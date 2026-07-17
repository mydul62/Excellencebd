import type { User } from '@/types'

/**
 * Demo credentials. In a real backend these would be validated server-side.
 * All demo accounts use the password: 123456
 */
export const demoUsers: (User & { password: string })[] = [
  {
    id: 'u-admin',
    name: 'অ্যাডমিন ব্যবহারকারী',
    email: 'admin@demo.com',
    password: '123456',
    role: 'admin',
    avatar: null,
    phone: '+880 1711 000000',
  },
  {
    id: 't1',
    name: 'আরিফ হোসেন',
    email: 'teacher@demo.com',
    password: '123456',
    role: 'teacher',
    avatar: null,
    phone: '+880 1711 100001',
  },
  {
    id: 's1',
    name: 'তাহসিন আহমেদ',
    email: 'student@demo.com',
    password: '123456',
    role: 'student',
    avatar: null,
    phone: '+880 1811 200001',
  },
]

export const DEMO_PASSWORD = '123456'
