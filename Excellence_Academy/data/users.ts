import type { User } from '@/types'

/**
 * Demo credentials. In a real backend these would be validated server-side.
 * All demo accounts use the password: 123456
 */
export const demoUsers: (User & { password: string })[] = [
  {
    id: 'u-admin',
    name: '???????? ???????????',
    email: 'admin@demo.com',
    password: '123456',
    role: 'admin',
    avatar: undefined,
    phone: '+880 1711 000000',
  },
  {
    id: 't1',
    name: '???? ?????',
    email: 'teacher@demo.com',
    password: '123456',
    role: 'teacher',
    avatar: undefined,
    phone: '+880 1711 100001',
  },
  {
    id: 's1',
    name: '?????? ?????',
    email: 'student@demo.com',
    password: '123456',
    role: 'student',
    avatar: undefined,
    phone: '+880 1811 200001',
  },
]

export const DEMO_PASSWORD = '123456'
