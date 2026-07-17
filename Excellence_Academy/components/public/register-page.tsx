'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  Sparkles,
  UserRoundPlus,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  BadgeCheck,
  Upload,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import Image from 'next/image'

// Matches the backend User model: name, email, password (required),
// phone (optional String? in Prisma). `role` is not sent — the API
// defaults new signups from this page to STUDENT.
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function onSubmit(values: RegisterFormValues) {
    try {
      // confirmPassword is client-side only — don't send it to the API
      const { confirmPassword, ...payload } = values

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', payload.name)
      formData.append('email', payload.email)
      formData.append('password', payload.password)
      if (payload.phone) {
        formData.append('phone', payload.phone)
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      // Call API directly with FormData
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      toast.success(`Welcome aboard, ${result.data.user.name}`)
      
      // Store user in localStorage (matching useAuth pattern)
      const clientUser = {
        id: result.data.user.id,
        name: result.data.user.name,
        email: result.data.user.email,
        role: result.data.user.role.toLowerCase(),
        avatar: result.data.user.avatar,
        phone: result.data.user.phone,
      }
      localStorage.setItem('bf_auth_user', JSON.stringify(clientUser))
      
      router.replace('/dashboard/student')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#f8fffb_0%,#f8fafc_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-sm font-medium text-emerald-600 shadow-sm">
            <Sparkles className="size-4" />
            Join Bright Future today
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Create your student account
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Sign up to unlock your dashboard, browse courses, track progress, and receive institution updates.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/70 p-5 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <BadgeCheck className="size-5 text-emerald-600" />
              <span>Instant demo onboarding with student access and role-based navigation.</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-lg">
          <Card className="border-border/60 bg-card/90 shadow-[0_20px_70px_-30px_rgba(16,185,129,0.35)]">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Register</CardTitle>
              <CardDescription>Create your account to continue into the student portal.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <UserRoundPlus className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" className="h-10 pl-9" placeholder="Jane Doe" {...register('name')} />
                  </div>
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Photo <span className="text-muted-foreground">(optional)</span></Label>
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <div className="relative size-20 overflow-hidden rounded-full border-2 border-border">
                        <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted">
                        <UserRoundPlus className="size-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="size-4" />
                        {avatarFile ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      <p className="mt-1 text-xs text-muted-foreground">Max 5MB, JPG/PNG</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" className="h-10 pl-9" placeholder="jane@example.com" {...register('email')} />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" className="h-10 pl-9" placeholder="+880 17..." {...register('phone')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="h-10 pl-9 pr-9"
                      placeholder="••••••••"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      className="h-10 pl-9 pr-9"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                  <ArrowRight className="size-4" />
                </Button>
              </form>

              <p className="mt-4 text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}