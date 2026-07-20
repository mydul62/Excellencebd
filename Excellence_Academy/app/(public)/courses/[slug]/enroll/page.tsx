'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2Icon, ArrowLeftIcon, Loader2, CheckIcon } from 'lucide-react'

import { getCourses } from '@/serverdata/courses'
import { createEnrollment, checkEnrollment, resubmitEnrollment } from '@/serverdata/enrollments'
import { getActivePaymentMethods, type ServerPaymentMethod } from '@/serverdata/paymentMethods'
import { uploadAvatarToCloudinary } from '@/serverdata/avatar-upload'
import { ImageUpload } from '@/components/ui/image-upload'
import type { ServerCourse } from '@/serverdata/courses'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// ─── Schema ───────────────────────────────────────────────────────────────────
const enrollSchema = z.object({
  paymentMethodId: z.string().min(1, 'Please select a payment method'),
  senderNumber:    z.string().min(7, 'Sender number is required'),
  transactionId:   z.string().min(4, 'Transaction ID is required'),
  amountSent:      z.coerce.number().min(1, 'Amount must be greater than 0'),
})
type EnrollFormValues = z.infer<typeof enrollSchema>

// ─── Resubmit schema ─────────────────────────────────────────────────────────
const resubmitSchema = z.object({
  senderNumber:  z.string().min(7, 'Sender number is required'),
  transactionId: z.string().min(4, 'Transaction ID is required'),
  amountSent:    z.coerce.number().min(1, 'Amount must be greater than 0'),
})
type ResubmitFormValues = z.infer<typeof resubmitSchema>

// ─── Component ────────────────────────────────────────────────────────────────
export default function EnrollPage() {
  const params  = useParams()
  const router  = useRouter()
  const slug    = params?.slug as string
  const { user, loading: authLoading } = useAuth()

  const [course,          setCourse]          = useState<ServerCourse | null>(null)
  const [loadingCourse,   setLoadingCourse]   = useState(true)
  const [paymentMethods,  setPaymentMethods]  = useState<ServerPaymentMethod[]>([])
  const [loadingMethods,  setLoadingMethods]  = useState(true)
  const [existingEnroll,  setExistingEnroll]  = useState<{ id: string; enrollmentStatus: string; rejectionReason?: string | null } | null>(null)
  const [success,         setSuccess]         = useState(false)
  const [uploading,       setUploading]       = useState(false)
  const [mode,            setMode]            = useState<'enroll' | 'resubmit'>('enroll')

  const screenshotRef    = useRef<File | null>(null)
  const [screenshotPrev, setScreenshotPrev]   = useState<string | null>(null)

  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema) as any,
    defaultValues: { paymentMethodId: '', senderNumber: '', transactionId: '', amountSent: 0 },
  })
  const resubmitForm = useForm<ResubmitFormValues>({
    resolver: zodResolver(resubmitSchema) as any,
    defaultValues: { senderNumber: '', transactionId: '', amountSent: 0 },
  })

  const selectedId     = form.watch('paymentMethodId')
  const selectedMethod = paymentMethods.find((m) => m.id === selectedId) ?? null
  const isBusy         = form.formState.isSubmitting || resubmitForm.formState.isSubmitting || uploading

  // ── Auth redirect ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?redirect=/courses/${slug}/enroll`)
  }, [authLoading, user, slug, router])

  // ── Pre-fill sender number ───────────────────────────────────────────────
  useEffect(() => {
    if (user?.phone) {
      form.setValue('senderNumber', user.phone)
      resubmitForm.setValue('senderNumber', user.phone)
    }
  }, [user, form, resubmitForm])

  // ── Load course + check enrollment ──────────────────────────────────────
  useEffect(() => {
    if (!slug) return
    getCourses({ limit: 100 })
      .then(({ data }) => {
        const found = data.find((c) => c.slug === slug)
        setCourse(found ?? null)
        if (found && user) {
          checkEnrollment(found.id)
            .then(({ enrolled, enrollment }) => {
              if (enrolled && enrollment) {
                setExistingEnroll(enrollment as any)
                if ((enrollment as any).enrollmentStatus === 'rejected') setMode('resubmit')
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoadingCourse(false))
  }, [slug, user])

  // ── Load payment methods ─────────────────────────────────────────────────
  useEffect(() => {
    getActivePaymentMethods().then(setPaymentMethods).catch(() => setPaymentMethods([]))
      .finally(() => setLoadingMethods(false))
  }, [])

  // ── Submit (new enrollment) ──────────────────────────────────────────────
  async function onSubmit(values: EnrollFormValues) {
    if (!user || !course) return
    setUploading(true)
    try {
      let paymentScreenshot: string | undefined
      if (screenshotRef.current) paymentScreenshot = await uploadAvatarToCloudinary(screenshotRef.current)
      await createEnrollment({
        userId: user.id, courseId: course.id,
        paymentMethodId: values.paymentMethodId,
        courseFee: course.price, amountSent: values.amountSent,
        senderNumber: values.senderNumber, transactionId: values.transactionId,
        paymentScreenshot,
      })
      setSuccess(true)
      toast.success('Enrollment submitted! Awaiting admin approval.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enrollment failed.')
    } finally { setUploading(false) }
  }

  // ── Resubmit (after rejection) ───────────────────────────────────────────
  async function onResubmit(values: ResubmitFormValues) {
    if (!existingEnroll) return
    setUploading(true)
    try {
      let paymentScreenshot: string | undefined
      if (screenshotRef.current) paymentScreenshot = await uploadAvatarToCloudinary(screenshotRef.current)
      await resubmitEnrollment(existingEnroll.id, {
        transactionId: values.transactionId, senderNumber: values.senderNumber,
        amountSent: values.amountSent, paymentScreenshot,
      })
      setSuccess(true)
      toast.success('Resubmitted! Awaiting admin review.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resubmission failed.')
    } finally { setUploading(false) }
  }

  // ── Guards ───────────────────────────────────────────────────────────────
  if (authLoading || loadingCourse) return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  )

  if (!course) return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-muted-foreground">Course not found.</p>
      <Button render={<Link href="/courses" />} variant="outline" className="mt-4">Browse Courses</Button>
    </div>
  )

  if (success) return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle2Icon className="size-16 text-emerald-500" />
          <h2 className="font-display text-2xl font-semibold">Enrollment Submitted!</h2>
          <p className="text-muted-foreground">
            Your enrollment for <strong>{course.title}</strong> is pending admin approval.
          </p>
          <div className="mt-2 flex gap-3">
            <Button render={<Link href="/dashboard/student" />}>My Dashboard</Button>
            <Button render={<Link href="/courses" />} variant="outline">Browse More</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Already enrolled and not rejected — show status
  if (existingEnroll && existingEnroll.enrollmentStatus !== 'rejected') return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle2Icon className="size-16 text-primary" />
          <h2 className="font-display text-2xl font-semibold">Already Enrolled</h2>
          <p className="text-muted-foreground">You are already enrolled in <strong>{course.title}</strong>.</p>
          <Badge variant={existingEnroll.enrollmentStatus === 'approved' ? 'default' : 'secondary'}>
            {existingEnroll.enrollmentStatus}
          </Badge>
          <Button render={<Link href="/dashboard/student" />}>Go to My Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  )

  // ── Payment method card helper ────────────────────────────────────────────
  const PaymentCards = ({ fieldName }: { fieldName: 'paymentMethodId' }) => (
    <div className="space-y-3">
      {loadingMethods ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : paymentMethods.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payment methods available.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {paymentMethods.map((m) => {
            const isSel = selectedId === m.id
            return (
              <button key={m.id} type="button" disabled={isBusy}
                onClick={() => form.setValue(fieldName, m.id, { shouldValidate: true })}
                className={cn('relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:border-primary/60 hover:shadow-sm',
                  isSel ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background',
                  isBusy && 'cursor-not-allowed opacity-60')}
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                  {m.logoUrl
                    ? <Image src={m.logoUrl} alt={m.name} width={48} height={48} className="size-full object-contain" unoptimized />
                    : <span className="text-lg font-bold text-muted-foreground">{m.name.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.accountNumber}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">{m.accountType}</Badge>
                </div>
                <div className={cn('absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border-2 transition-all duration-200',
                  isSel ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background')}>
                  {isSel && <CheckIcon className="size-3" />}
                </div>
              </button>
            )
          })}
        </div>
      )}
      {selectedMethod && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-semibold">Payment Details</p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div><p className="text-xs text-muted-foreground">Receiver Number</p><p className="font-mono font-medium">{selectedMethod.accountNumber}</p></div>
            <div><p className="text-xs text-muted-foreground">Account Name</p><p className="font-medium">{selectedMethod.accountName}</p></div>
            <div><p className="text-xs text-muted-foreground">Account Type</p><p className="font-medium capitalize">{selectedMethod.accountType}</p></div>
            <div><p className="text-xs text-muted-foreground">Amount to Send</p><p className="font-bold text-primary">{formatCurrency(course.price)}</p></div>
          </div>
          {selectedMethod.instructions && (
            <div className="border-t border-primary/10 pt-3">
              <p className="text-xs text-muted-foreground">Instructions</p>
              <p className="mt-0.5 text-sm">{selectedMethod.instructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // ── Screenshot upload block (shared between enroll + resubmit) ───────────
  const ScreenshotUpload = () => (
    <div className="space-y-2">
      <Label>Payment Screenshot <span className="text-muted-foreground">(optional)</span></Label>
      <ImageUpload
        shape="rect"
        existingUrl={screenshotPrev}
        disabled={isBusy}
        onFileSelect={(file) => {
          screenshotRef.current = file
          if (screenshotPrev) URL.revokeObjectURL(screenshotPrev)
          setScreenshotPrev(URL.createObjectURL(file))
        }}
        onClear={() => {
          screenshotRef.current = null
          if (screenshotPrev) URL.revokeObjectURL(screenshotPrev)
          setScreenshotPrev(null)
        }}
      />
      <p className="text-xs text-muted-foreground">JPG · PNG · WebP — max 5 MB</p>
    </div>
  )

  // ── RESUBMIT view (rejected enrollment) ──────────────────────────────────
  if (mode === 'resubmit' && existingEnroll) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Button render={<Link href={`/courses/${slug}`} />} variant="outline" size="sm">
            <ArrowLeftIcon className="mr-1 size-4" /> Back
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Resubmit Enrollment</h1>
            <p className="text-sm text-muted-foreground">{course.title}</p>
          </div>
        </div>

        {/* Rejection reason banner */}
        {existingEnroll.rejectionReason && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive">Rejected by admin</p>
            <p className="mt-1 text-sm text-muted-foreground">{existingEnroll.rejectionReason}</p>
          </div>
        )}

        {/* Course summary */}
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">{course.title}</p>
              <p className="text-sm text-muted-foreground">{course.category} · {course.level}</p>
            </div>
            <span className="font-display text-xl font-bold text-primary">{formatCurrency(course.price)}</span>
          </CardContent>
        </Card>

        <form onSubmit={resubmitForm.handleSubmit(onResubmit as any)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Corrected Payment Details</CardTitle>
              <CardDescription>Update your transaction information and resubmit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="rs-sender">Sender Number</Label>
                  <Input id="rs-sender" {...resubmitForm.register('senderNumber')} placeholder="The number you sent from" disabled={isBusy} />
                  {resubmitForm.formState.errors.senderNumber && (
                    <p className="text-xs text-destructive">{resubmitForm.formState.errors.senderNumber.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rs-txn">Transaction ID</Label>
                  <Input id="rs-txn" {...resubmitForm.register('transactionId')} placeholder="e.g. TXN123456789" disabled={isBusy} />
                  {resubmitForm.formState.errors.transactionId && (
                    <p className="text-xs text-destructive">{resubmitForm.formState.errors.transactionId.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="rs-amount">Amount Sent (৳)</Label>
                <Input id="rs-amount" type="number" min={0} step={1} {...resubmitForm.register('amountSent')} disabled={isBusy} />
                {resubmitForm.formState.errors.amountSent && (
                  <p className="text-xs text-destructive">{resubmitForm.formState.errors.amountSent.message}</p>
                )}
              </div>
              <Separator />
              <ScreenshotUpload />
              <Button type="submit" className="w-full" disabled={isBusy}>
                {isBusy ? <><Loader2 className="mr-2 size-4 animate-spin" />{uploading ? 'Uploading…' : 'Resubmitting…'}</> : 'Resubmit Enrollment'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    )
  }

  // ── MAIN ENROLL view ──────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button render={<Link href={`/courses/${slug}`} />} variant="outline" size="sm">
          <ArrowLeftIcon className="mr-1 size-4" /> Back
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
            <p className="text-sm text-muted-foreground">{course.category} · {course.level} · {course.duration}</p>
          </div>
          <span className="font-display text-xl font-bold text-primary">{formatCurrency(course.price)}</span>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">

        {/* ── Payment Method selection ── */}
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
            <CardDescription>Choose how you will send the course fee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PaymentCards fieldName="paymentMethodId" />
            {form.formState.errors.paymentMethodId && (
              <p className="text-xs text-destructive">{form.formState.errors.paymentMethodId.message}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Payment confirmation ── */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Confirmation</CardTitle>
            <CardDescription>Send the fee to the receiver above, then fill in the details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="senderNumber">Your Sender Number</Label>
                <Input id="senderNumber" {...form.register('senderNumber')} placeholder="Number you sent from" disabled={isBusy} />
                {form.formState.errors.senderNumber && (
                  <p className="text-xs text-destructive">{form.formState.errors.senderNumber.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input id="transactionId" {...form.register('transactionId')} placeholder="e.g. TXN123456789" disabled={isBusy} />
                {form.formState.errors.transactionId && (
                  <p className="text-xs text-destructive">{form.formState.errors.transactionId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="amountSent">Amount Sent (৳)</Label>
              <Input id="amountSent" type="number" min={0} step={1}
                defaultValue={course.price}
                {...form.register('amountSent')}
                disabled={isBusy}
              />
              <p className="text-xs text-muted-foreground">Course fee is {formatCurrency(course.price)}. Enter the exact amount you sent.</p>
              {form.formState.errors.amountSent && (
                <p className="text-xs text-destructive">{form.formState.errors.amountSent.message}</p>
              )}
            </div>

            <Separator />

            <ScreenshotUpload />

            <Button type="submit" className="w-full" disabled={isBusy}>
              {isBusy
                ? <><Loader2 className="mr-2 size-4 animate-spin" />{uploading ? 'Uploading screenshot…' : 'Submitting…'}</>
                : `Submit Enrollment — ${formatCurrency(course.price)}`}
            </Button>
          </CardContent>
        </Card>

      </form>
    </div>
  )
}
