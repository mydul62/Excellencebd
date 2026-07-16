'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, BookOpenCheck, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') ?? ''
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const user = await login(values.email, values.password)
      toast.success(`Welcome back, ${user.name}`)
      const destination = redirectPath || `/dashboard/${user.role}`
      router.replace(destination)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_35%),linear-gradient(135deg,#f8fbff_0%,#f8fafc_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-sm font-medium text-primary shadow-sm">
            <Sparkles className="size-4" />
            Sign in with your account credentials
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Sign in to your coaching dashboard
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Experience a premium admin, teacher, and student workspace with real-time styled analytics and smooth workflows.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/70 p-5 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <BookOpenCheck className="size-5 text-primary" />
              <span>Sign in with your registered credentials to continue.</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-lg">
          <Card className="border-border/60 bg-card/90 shadow-[0_20px_70px_-30px_rgba(37,99,235,0.45)]">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Welcome back</CardTitle>
              <CardDescription>Enter your email and password to sign in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" className="h-10 pl-9" {...register('email')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" className="h-10 pl-9" {...register('password')} />
                  </div>
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="size-4" />
                </Button>
              </form>

              <p className="text-sm text-muted-foreground">
                Need an account? <Link href="/register" className="font-medium text-primary hover:underline">Create a student account</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
