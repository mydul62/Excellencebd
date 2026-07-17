'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowRightIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { Course } from '@/types'

interface CourseEnrollDetailsProps {
  course: Course
}

export function CourseEnrollDetails({ course }: CourseEnrollDetailsProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=/courses/${course.slug}/enroll`)
    }
  }, [loading, user, router, course.slug])

  const [transactionId, setTransactionId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Bank transfer')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!transactionId.trim()) {
      toast.error('Please enter your transaction ID before submitting.')
      return
    }

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSubmitting(false)
    setSubmitted(true)
    toast.success('Enrollment request submitted successfully.')
  }

  if (!user) {
    return <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">Redirecting to login…</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border/70 bg-white/90 p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="default">Manual payment</Badge>
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-foreground">{course.title}</h1>
              <p className="text-sm text-muted-foreground">{course.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Student: <span className="font-medium text-foreground">{user.name}</span> · {user.email}
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-primary/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Fee</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(course.price)}</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Complete your enrollment</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Follow the three steps below to complete your manual payment and confirm your course enrollment.
              </p>
            </div>

            <div className="grid gap-4 rounded-3xl border border-border/70 bg-background/70 p-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Step 1</p>
                <p className="text-sm text-muted-foreground">
                  Transfer the course fee using the details below. Use the course title as the payment reference.
                </p>
              </div>
              <div className="space-y-2 rounded-2xl bg-white/90 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Bank details</p>
                <p className="font-medium text-foreground">Bank: Bright Future Bank</p>
                <p className="text-sm text-muted-foreground">Account: 0123456789</p>
                <p className="text-sm text-muted-foreground">Branch: Main Campus</p>
                <p className="text-sm text-muted-foreground">Reference: {course.title}</p>
              </div>
            </div>

            <div className="grid gap-4 rounded-3xl border border-border/70 bg-background/70 p-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Step 2</p>
                <p className="text-sm text-muted-foreground">
                  Enter your payment details below and submit the transaction for review.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/90 p-4 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-id">Transaction ID</Label>
                    <Input
                      id="transaction-id"
                      value={transactionId}
                      onChange={(event) => setTransactionId(event.target.value)}
                      placeholder="Enter transaction ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment method</Label>
                    <Input
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      placeholder="e.g. Bank transfer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Payment note</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add any extra details or transaction note"
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : submitted ? 'Update payment info' : 'Submit payment details'}
                </Button>
              </form>
            </div>

            <div className="space-y-3 rounded-3xl border border-border/70 bg-background/70 p-5">
              <h3 className="text-lg font-semibold text-foreground">Step 3</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                After submission, our team will verify your payment and update your student dashboard within 24 hours.
              </p>
              {submitted ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Your transaction has been recorded. Please keep your payment receipt and wait for our confirmation email.
                </div>
              ) : (
                <div className="rounded-2xl border border-border/70 bg-white/90 p-4 text-sm text-muted-foreground">
                  You can also share payment proof via email or WhatsApp after submitting the form.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Course details</p>
              <p className="text-lg font-semibold text-foreground">{course.title}</p>
              <p className="text-sm text-muted-foreground">{course.level} · {course.duration}</p>
            </div>
            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Instructor:</span> {course.teacherId}</p>
              <p><span className="font-medium text-foreground">Batch size:</span> {course.seats}</p>
              <p><span className="font-medium text-foreground">Rating:</span> {course.rating.toFixed(1)}</p>
            </div>
            <Button render={<Link href="/dashboard/student" />} className="w-full">
              Go to student dashboard
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </aside>
        </div>
      </div>
    </div>
  )
}
