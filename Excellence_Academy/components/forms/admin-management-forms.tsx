'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import { createStudent } from '@/serverdata/students'
import { createCourse } from '@/serverdata/courses'
import { createNotice } from '@/serverdata/notices'
import { uploadAvatarToCloudinary } from '@/serverdata/avatar-upload'
import { AvatarUpload } from '@/components/ui/image-upload'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// ─────────────────────────────────────────────────────────────────────────────
// Student Registration Form
// POST /api/students — ADMIN only
// ─────────────────────────────────────────────────────────────────────────────

const studentSchema = z.object({
  name: z.string().trim().min(3, 'Full name is required.'),
  email: z.string().trim().email('A valid email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  phone: z.string().trim().min(8, 'Phone number is required.'),
  guardian: z.string().trim().min(2, 'Guardian name is required.'),
  address: z.string().trim().min(6, 'Address is required.'),
  status: z.enum(['active', 'inactive']),
})

type StudentFormValues = z.infer<typeof studentSchema>

export function StudentRegistrationForm() {
  const router = useRouter()
  const avatarFileRef = useRef<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

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
      password: '',
      phone: '',
      guardian: '',
      address: '',
      status: 'active',
    },
  })

  const isBusy = isSubmitting || uploading

  async function onSubmit(values: StudentFormValues) {
    setUploading(true)
    try {
      let avatarUrl: string | undefined
      if (avatarFileRef.current) {
        avatarUrl = await uploadAvatarToCloudinary(avatarFileRef.current)
      }

      await createStudent({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        guardian: values.guardian,
        address: values.address,
        status: values.status,
        avatar: avatarUrl,
      })
      toast.success('Student registered successfully')
      reset()
      avatarFileRef.current = null
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      setAvatarPreview(null)
      router.push('/dashboard/admin/students')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register student')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="grid gap-4">
      {/* ── Avatar ── */}
      <div className="grid gap-2">
        <Label>Profile Picture <span className="text-muted-foreground">(optional)</span></Label>
        <AvatarUpload
          existingUrl={avatarPreview}
          uploading={uploading}
          disabled={isBusy}
          onFileSelect={(file) => {
            avatarFileRef.current = file
            if (avatarPreview) URL.revokeObjectURL(avatarPreview)
            setAvatarPreview(URL.createObjectURL(file))
          }}
          onClear={() => {
            avatarFileRef.current = null
            if (avatarPreview) URL.revokeObjectURL(avatarPreview)
            setAvatarPreview(null)
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-name">Full name</Label>
        <Input id="student-name" placeholder="Nadia Rahman" {...register('name')} disabled={isBusy} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-email">Email</Label>
        <Input id="student-email" type="email" placeholder="student@email.com" {...register('email')} disabled={isBusy} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-password">Password</Label>
        <Input id="student-password" type="password" placeholder="••••••••" {...register('password')} disabled={isBusy} />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="student-phone">Phone</Label>
          <Input id="student-phone" placeholder="01XXXXXXXXX" {...register('phone')} disabled={isBusy} />
          {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="student-status">Status</Label>
          <select
            id="student-status"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
            {...register('status')}
            disabled={isBusy}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-guardian">Guardian</Label>
        <Input id="student-guardian" placeholder="Parent / Guardian name" {...register('guardian')} disabled={isBusy} />
        {errors.guardian ? <p className="text-sm text-destructive">{errors.guardian.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-address">Address</Label>
        <Textarea id="student-address" placeholder="Student address" {...register('address')} disabled={isBusy} />
        {errors.address ? <p className="text-sm text-destructive">{errors.address.message}</p> : null}
      </div>

      <Button type="submit" disabled={isBusy}>
        {uploading ? 'Uploading photo…' : isSubmitting ? 'Registering…' : 'Register Student'}
      </Button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Course Registration Form
// POST /api/courses — ADMIN only
// ─────────────────────────────────────────────────────────────────────────────

const courseSchema = z.object({
  title: z.string().trim().min(3, 'Course title is required.'),
  category: z.string().trim().min(2, 'Category is required.'),
  duration: z.string().trim().min(2, 'Duration is required.'),
  price: z.coerce.number().min(0, 'Price is required.'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  seats: z.coerce.number().min(1, 'Seats are required.'),
  description: z.string().trim().min(10, 'Add a short description.'),
  teacherId: z.string().trim().optional(),
})

type CourseFormValues = z.infer<typeof courseSchema>

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CourseRegistrationForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: '',
      category: '',
      duration: '',
      price: 0,
      level: 'Beginner',
      seats: 25,
      description: '',
      teacherId: '',
    },
  })

  async function onSubmit(values: CourseFormValues) {
    try {
      await createCourse({
        title: values.title,
        slug: slugify(values.title),
        category: values.category,
        duration: values.duration,
        price: values.price,
        level: values.level,
        seats: values.seats,
        description: values.description,
        teacherId: values.teacherId || undefined,
      })
      toast.success('Course created successfully')
      reset()
      router.push('/dashboard/admin/courses')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create course')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="grid gap-4">
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
          <Input id="course-price" type="number" min={0} placeholder="15000" {...register('price')} />
          {errors.price ? <p className="text-sm text-destructive">{errors.price.message}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="course-seat">Seats</Label>
          <Input id="course-seat" type="number" min={1} placeholder="25" {...register('seats')} />
          {errors.seats ? <p className="text-sm text-destructive">{errors.seats.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-level">Level</Label>
        <select
          id="course-level"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
          {...register('level')}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        {errors.level ? <p className="text-sm text-destructive">{errors.level.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-teacher">Teacher ID (optional)</Label>
        <Input id="course-teacher" placeholder="Teacher profile ID" {...register('teacherId')} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-description">Description</Label>
        <Textarea
          id="course-description"
          placeholder="Describe the program outcome and expectations."
          {...register('description')}
        />
        {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create Course'}
      </Button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Notice Registration Form
// POST /api/notices — ADMIN only
// ─────────────────────────────────────────────────────────────────────────────

const noticeSchema = z.object({
  title: z.string().trim().min(3, 'Notice title is required.'),
  content: z.string().trim().min(8, 'Notice content is required.'),
  category: z.enum(['general', 'academic', 'exam', 'holiday', 'event']),
  audience: z.enum(['all', 'students', 'teachers', 'parents']),
})

type NoticeFormValues = z.infer<typeof noticeSchema>

export function NoticeRegistrationForm() {
  const router = useRouter()
  const { user } = useAuth()

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

  async function onSubmit(values: NoticeFormValues) {
    try {
      await createNotice({
        title: values.title,
        content: values.content,
        category: values.category,
        audience: values.audience,
        author: user?.name ?? 'Admin',
        date: new Date().toISOString(),
      })
      toast.success('Notice published successfully')
      reset()
      router.push('/dashboard/admin/notices')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish notice')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="notice-title">Title</Label>
        <Input id="notice-title" placeholder="Exam schedule updated" {...register('title')} />
        {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notice-content">Content</Label>
        <Textarea
          id="notice-content"
          placeholder="Describe the update in a concise but informative way."
          rows={4}
          {...register('content')}
        />
        {errors.content ? <p className="text-sm text-destructive">{errors.content.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="notice-category">Category</Label>
          <select
            id="notice-category"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
            {...register('category')}
          >
            <option value="general">General</option>
            <option value="academic">Academic</option>
            <option value="exam">Exam</option>
            <option value="holiday">Holiday</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notice-audience">Audience</Label>
          <select
            id="notice-audience"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
            {...register('audience')}
          >
            <option value="all">All</option>
            <option value="students">Students</option>
            <option value="teachers">Teachers</option>
            <option value="parents">Parents</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Publishing…' : 'Publish Notice'}
      </Button>
    </form>
  )
}

