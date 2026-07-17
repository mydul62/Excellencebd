'use client'

import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

import { SectionCard } from '@/components/dashboard/section-card'
import { SendEmailForm } from '@/components/dashboard/send-email-form'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export default function TeacherContactPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Mail className="h-4 w-4" />Send Message
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Contact Admin</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Have a question or concern? Send a message to the academy administration.
            </p>
          </div>
          <Button render={<Link href="/dashboard/teacher" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title="Send Email"
        description="Your message will be delivered to the academy administration."
      >
        <SendEmailForm
          defaultName={user?.name ?? ''}
          defaultEmail={user?.email ?? ''}
        />
      </SectionCard>
    </div>
  )
}
