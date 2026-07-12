import Link from 'next/link'
import { ArrowLeft, GraduationCap } from 'lucide-react'

import { SectionCard } from '@/components/dashboard/section-card'
import { TeacherRegistrationForm } from '@/components/forms/teacher-registration-form'
import { Button } from '@/components/ui/button'

export default function TeacherRegisterPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <GraduationCap className="h-4 w-4" />
              Teacher registration
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Create a new teacher profile</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Capture every detail in a dedicated page built for professional onboarding.</p>
          </div>

          <Button render={<Link href="/dashboard/admin/teachers" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to teachers
          </Button>
        </div>
      </div>

      <SectionCard title="Teacher Registration" description="Register a new teacher.">
        <TeacherRegistrationForm />
      </SectionCard>
    </div>
  )
}