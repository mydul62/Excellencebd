import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'

import { StudentRegistrationForm } from '@/components/forms/admin-management-forms'
import { SectionCard } from '@/components/dashboard/section-card'
import { Button } from '@/components/ui/button'

export default function AdminStudentRegisterPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <UserPlus className="h-4 w-4" />
              Student registration
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Register a new student</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Use this page to add a student profile and save it with a professional onboarding flow.</p>
          </div>

          <Button render={<Link href="/dashboard/admin/students" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to students
          </Button>
        </div>
      </div>

      <SectionCard title="Student Registration" description="Create a personal profile for a new learner.">
        <StudentRegistrationForm />
      </SectionCard>
    </div>
  )
}
