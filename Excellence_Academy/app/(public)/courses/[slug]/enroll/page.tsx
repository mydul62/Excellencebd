'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getCourses } from '@/serverdata/courses'
import { createEnrollment, checkEnrollment } from '@/serverdata/enrollments'
import type { ServerCourse } from '@/serverdata/courses'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, CheckCircle2Icon } from 'lucide-react'
import Link from 'next/link'

const enrollSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone is required'),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'bank'], {
    required_error: 'Select a payment method',
  }),
  transactionId: z.string().min(4, 'Transaction ID is required'),
  notes: z.string().optional(),
})

type EnrollFormValues = z.infer<typeof enrollSchema>

const PAYMENT_METHODS = [
  { value: 'bkash',  label: 'bKash',  number: '01XXXXXXXXX' },
  { value: 'nagad',  label: 'Nagad',  number: '01XXXXXXXXX' },
  { value: 'rocket', label: 'Rocket', number: '01XXXXXXXXX' },
  { value: 'bank',   label: 'Bank Transfer', number: 'Account: XXXXXXXXXXXX' },
]

export default function EnrollPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const { user, loading: authLoading } = useAuth()

  const [course, setCourse] = useState<ServerCourse | null>(null)
  const [loadingCourse, setLoadingCourse] = useState(true)
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
  })

  const selectedMethod = watch('paymentMethod')

  // Pre-fill from auth
  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
      if (user.phone) setValue('phone', user.phone)
    }
  }, [user, setValue])

  // Load course
  useEffect(() => {
    if (!slug) return
    getCourses({ limit: 100 })
      .then(({ data }) => {
        const found = data.find((c) => c.slug === slug)
        setCourse(found ?? null)
        if (found && user) {
          checkEnrollment(found.id)
            .then(({ enrolled }) => setAlreadyEnrolled(enrolled))
            .catch(() => {})
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoadingCourse(false))
  }, [slug, user])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/courses/${slug}/enroll`)
    }
  }, [authLoading, user, slug, router])

  async function onSubmit(values: EnrollFormValues) {
    if (!user || !course) return
    try {
      await createEnrollment({
        userId: user.id,
        courseId: course.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        paymentMethod: values.paymentMethod,
        transactionId: values.transactionId,
        notes: values.notes,
      })
      setSuccess(true)
      toast.success('Enrollment submitted! Awaiting admin approval.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enrollment failed. Please try again.')
    }
  }

  // Loading states
  if (authLoading || loadingCourse) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Course not found.</p>
        <Button render={<Link href="/courses" />} variant="outline" className="mt-4">Browse Courses</Button>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <CheckCircle2Icon className="size-16 text-emerald-500" />
            <h2 className="font-display text-2xl font-semibold text-foreground">Enrollment Submitted!</h2>
            <p className="text-muted-foreground">
              Your enrollment for <strong>{course.title}</strong> has been submitted and is pending admin approval.
              You will be notified once approved.
            </p>
            <div className="flex gap-3 mt-2">
              <Button render={<Link href="/dashboard/student/courses" />}>
                My Courses
              </Button>
              <Button render={<Link href="/courses" />} variant="outline">
                Browse More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Already enrolled
  if (alreadyEnrolled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <CheckCircle2Icon className="size-16 text-primary" />
            <h2 className="font-display text-2xl font-semibold text-foreground">Already Enrolled</h2>
            <p className="text-muted-foreground">You are already enrolled in <strong>{course.title}</strong>.</p>
            <Button render={<Link href="/dashboard/student/courses" />}>Go to My Courses</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Button render={<Link href={`/courses/${slug}`} />} variant="outline" size="sm">
          <ArrowLeftIcon className="size-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Enroll in Course</h1>
          <p className="text-sm text-muted-foreground">{course.title}</p>
        </div>
      </div>

      {/* Course summary */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium text-foreground">{course.title}</p>
            <p className="text-sm text-muted-foreground">{course.category} • {course.level} • {course.duration}</p>
          </div>
          <span className="font-display text-xl font-bold text-primary">{formatCurrency(course.price)}</span>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Confirm your details before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} placeholder="Your full name" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} placeholder="you@example.com" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...register('phone')} placeholder="+880 1X..." />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setValue('paymentMethod', m.value as any)}
                    className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                      selectedMethod === m.value
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.number}</p>
                  </button>
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>
              )}
            </div>

            {selectedMethod && (
              <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Payment Instructions</p>
                <p>Send <strong>{formatCurrency(course.price)}</strong> to the {PAYMENT_METHODS.find(m => m.value === selectedMethod)?.label} number above.</p>
                <p>Enter the Transaction ID you received after payment below.</p>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input id="transactionId" {...register('transactionId')} placeholder="e.g. TXN123456789" />
              {errors.transactionId && (
                <p className="text-xs text-destructive">{errors.transactionId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Input id="notes" {...register('notes')} placeholder="Any notes for the admin..." />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : `Submit Enrollment — ${formatCurrency(course.price)}`}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
