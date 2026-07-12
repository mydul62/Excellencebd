import type { Review } from '@/types'

export const reviews: Review[] = [
  {
    id: 'r1',
    name: 'Nusrat Jahan',
    avatar: 'https://i.pravatar.cc/150?img=44',
    role: 'HSC Student',
    rating: 5,
    featured: true,
    comment:
      'The teachers here are incredibly supportive. My grades improved dramatically after joining the HSC Academic program. Highly recommended!',
  },
  {
    id: 'r2',
    name: 'Fahim Rahman',
    avatar: 'https://i.pravatar.cc/150?img=60',
    role: 'Web Development Student',
    rating: 5,
    featured: true,
    comment:
      'I built my first full-stack app during the Web Development course. The project-based approach made everything click for me.',
  },
  {
    id: 'r3',
    name: 'Mim Akter',
    avatar: 'https://i.pravatar.cc/150?img=32',
    role: 'IELTS Student',
    rating: 5,
    featured: true,
    comment:
      'Scored 7.5 in IELTS thanks to the focused speaking sessions. The mock tests felt exactly like the real exam.',
  },
  {
    id: 'r4',
    name: 'Riyad Hossain',
    avatar: 'https://i.pravatar.cc/150?img=59',
    role: 'Physics Student',
    rating: 4,
    comment:
      'Physics finally makes sense to me. The live demonstrations and problem-solving classes are the best part of the course.',
  },
  {
    id: 'r5',
    name: 'Sadia Afrin',
    avatar: 'https://i.pravatar.cc/150?img=36',
    role: 'HSC Student',
    rating: 5,
    comment:
      'Great learning environment with a caring faculty. The regular tests kept me on track throughout the whole year.',
  },
  {
    id: 'r6',
    name: 'Nafis Iqbal',
    avatar: 'https://i.pravatar.cc/150?img=57',
    role: 'Python Student',
    rating: 5,
    comment:
      'From zero coding knowledge to writing my own automation scripts. The instructors are patient and truly knowledgeable.',
  },
]
