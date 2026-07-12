'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const studentSchema = z.object({
  name: z.string().trim().min(3, 'Full name is required.'),
  email: z.string().trim().email('A valid email is required.'),
  phone: z.string().trim().min(8, 'Phone number is required.'),
  guardian: z.string().trim().min(2, 'Guardian name is required.'),
  address: z.string().trim().min(6, 'Address is required.'),
  status: z.enum(['active', 'inactive']),
})

type StudentFormValues = z.infer<typeof studentSchema>

export function StudentRegistrationForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      guardian: '',
      address: '',
      status: 'active',
    },
  })

  const onSubmit = (values: StudentFormValues) => {
    console.log('Student registration submitted:', values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="student-name">Full name</Label>
        <Input id="student-name" placeholder="Nadia Rahman" {...register('name')} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-email">Email</Label>
        <Input id="student-email" type="email" placeholder="student@email.com" {...register('email')} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="student-phone">Phone</Label>
          <Input id="student-phone" placeholder="01XXXXXXXXX" {...register('phone')} />
          {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="student-status">Status</Label>
          <select id="student-status" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-guardian">Guardian</Label>
        <Input id="student-guardian" placeholder="Parent / Guardian name" {...register('guardian')} />
        {errors.guardian ? <p className="text-sm text-destructive">{errors.guardian.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-address">Address</Label>
        <Textarea id="student-address" placeholder="Student address" {...register('address')} />
        {errors.address ? <p className="text-sm text-destructive">{errors.address.message}</p> : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering…' : 'Register Student'}
      </Button>
    </form>
  )
}

const courseSchema = z.object({
  title: z.string().trim().min(3, 'Course title is required.'),
  category: z.string().trim().min(2, 'Category is required.'),
  duration: z.string().trim().min(2, 'Duration is required.'),
  price: z.string().trim().min(1, 'Price is required.'),
  level: z.string().trim().min(2, 'Level is required.'),
  seats: z.string().trim().min(1, 'Seats are required.'),
  description: z.string().trim().min(10, 'Add a short description.'),
})

type CourseFormValues = z.infer<typeof courseSchema>

export function CourseRegistrationForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      category: '',
      duration: '',
      price: '',
      level: '',
      seats: '',
      description: '',
    },
  })

  const onSubmit = (values: CourseFormValues) => {
    console.log('Course registration submitted:', values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="course-title">Course title</Label>
        <Input id="course-title" placeholder="Advanced Web Design" {...register('title')} />
        {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-category">Category</Label>
        <Input id="course-category" placeholder="UI / UX" {...register('category')} />
        {errors.category ? <p className="text-sm text-destructive">{errors.category.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-duration">Duration</Label>
        <Input id="course-duration" placeholder="8 weeks" {...register('duration')} />
        {errors.duration ? <p className="text-sm text-destructive">{errors.duration.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="course-price">Price (৳)</Label>
          <Input id="course-price" type="number" placeholder="15000" {...register('price')} />
          {errors.price ? <p className="text-sm text-destructive">{errors.price.message}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="course-seat">Seats</Label>
          <Input id="course-seat" type="number" placeholder="25" {...register('seats')} />
          {errors.seats ? <p className="text-sm text-destructive">{errors.seats.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-level">Level</Label>
        <Input id="course-level" placeholder="Intermediate" {...register('level')} />
        {errors.level ? <p className="text-sm text-destructive">{errors.level.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-description">Description</Label>
        <Textarea id="course-description" placeholder="Describe the program outcome and expectations." {...register('description')} />
        {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create Course'}
      </Button>
    </form>
  )
}

const noticeSchema = z.object({
  title: z.string().trim().min(3, 'Notice title is required.'),
  content: z.string().trim().min(8, 'Notice content is required.'),
  category: z.enum(['general', 'exam', 'event', 'urgent']),
  audience: z.enum(['all', 'students', 'teachers']),
})

type NoticeFormValues = z.infer<typeof noticeSchema>

export function NoticeRegistrationForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
      audience: 'all',
    },
  })

  const onSubmit = (values: NoticeFormValues) => {
    console.log('Notice submitted:', values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="notice-title">Title</Label>
        <Input id="notice-title" placeholder="Exam schedule updated" {...register('title')} />
        {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notice-content">Content</Label>
        <Textarea id="notice-content" placeholder="Describe the update in a concise but informative way." {...register('content')} />
        {errors.content ? <p className="text-sm text-destructive">{errors.content.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="notice-category">Category</Label>
          <select id="notice-category" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none" {...register('category')}>
            <option value="general">General</option>
            <option value="exam">Exam</option>
            <option value="event">Event</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notice-audience">Audience</Label>
          <select id="notice-audience" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none" {...register('audience')}>
            <option value="all">All</option>
            <option value="students">Students</option>
            <option value="teachers">Teachers</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Publishing…' : 'Publish Notice'}
      </Button>
    </form>
  )
}
