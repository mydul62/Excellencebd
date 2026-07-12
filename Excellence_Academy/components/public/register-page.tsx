'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Sparkles, UserRoundPlus, Mail, Phone, BadgeCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(7, 'Phone number is required'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      const user = await registerUser(values)
      toast.success(`Welcome aboard, ${user.name}`)
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" className="h-10 pl-9" placeholder="jane@example.com" {...register('email')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" className="h-10 pl-9" placeholder="+880 17..." {...register('phone')} />
                  </div>
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
