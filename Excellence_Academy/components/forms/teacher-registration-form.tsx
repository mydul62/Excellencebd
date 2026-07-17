'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { createTeacher } from '@/serverdata/teachers'
import { uploadAvatarToCloudinary } from '@/serverdata/avatar-upload'
import { AvatarUpload } from '@/components/ui/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1, 'Subject is required'),
  experienceYears: z.coerce.number().min(0, 'Must be 0 or more'),
  qualification: z.string().trim().optional(),
  bio: z.string().trim().optional(),
})

type FormValues = z.infer<typeof schema>

export function TeacherRegistrationForm() {
  const router = useRouter()
  const avatarFileRef = useRef<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      subject: '',
      experienceYears: 0,
      qualification: '',
      bio: '',
    },
  })

  const isBusy = isSubmitting || uploading

  async function onSubmit(values: FormValues) {
    setUploading(true)
    try {
      let avatarUrl: string | undefined
      if (avatarFileRef.current) {
        avatarUrl = await uploadAvatarToCloudinary(avatarFileRef.current)
      }

      await createTeacher({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        subject: values.subject,
        experienceYears: values.experienceYears,
        qualification: values.qualification || undefined,
        bio: values.bio || undefined,
        avatar: avatarUrl,
      })
      toast.success('Teacher registered successfully')
      reset()
      avatarFileRef.current = null
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      setAvatarPreview(null)
      router.push('/dashboard/admin/teachers')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register teacher')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
        <Label htmlFor="t-name">Full Name</Label>
        <Input id="t-name" placeholder="Teacher Name" {...register('name')} disabled={isBusy} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="t-email">Email</Label>
        <Input id="t-email" type="email" placeholder="teacher@email.com" {...register('email')} disabled={isBusy} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="t-password">Password</Label>
        <Input id="t-password" type="password" placeholder="••••••••" {...register('password')} disabled={isBusy} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="t-phone">Phone</Label>
        <Input id="t-phone" placeholder="01XXXXXXXXX" {...register('phone')} disabled={isBusy} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="t-subject">Subject</Label>
        <Input id="t-subject" placeholder="Mathematics" {...register('subject')} disabled={isBusy} />
        {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="t-exp">Experience (Years)</Label>
        <Input id="t-exp" type="number" min={0} placeholder="5" {...register('experienceYears')} disabled={isBusy} />
        {errors.experienceYears && (
          <p className="text-sm text-destructive">{errors.experienceYears.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="t-qual">Qualification</Label>
        <Input id="t-qual" placeholder="M.Sc in Mathematics" {...register('qualification')} disabled={isBusy} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="t-bio">Bio</Label>
        <Textarea id="t-bio" placeholder="Short biography…" rows={3} {...register('bio')} disabled={isBusy} />
      </div>

      <Button type="submit" disabled={isBusy}>
        {uploading ? 'Uploading photo…' : isSubmitting ? 'Registering…' : 'Register Teacher'}
      </Button>
    </form>
  )
}
