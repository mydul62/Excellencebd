import Link from 'next/link'
import { ArrowLeft, BellRing } from 'lucide-react'

import { NoticeRegistrationForm } from '@/components/forms/admin-management-forms'
import { SectionCard } from '@/components/dashboard/section-card'
import { Button } from '@/components/ui/button'

export default function AdminNoticeRegisterPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BellRing className="h-4 w-4" />
              Notice publishing
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Publish a new notice</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Use this page to create a fresh announcement with the proper audience and category.</p>
          </div>

          <Button render={<Link href="/dashboard/admin/notices" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to notices
          </Button>
        </div>
      </div>

      <SectionCard title="Notice Registration" description="Share updates with your audience.">
        <NoticeRegistrationForm />
      </SectionCard>
    </div>
  )
}
