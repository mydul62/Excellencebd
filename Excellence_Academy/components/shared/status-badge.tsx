import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type {
  EnrollmentStatus,
  NoticeCategory,
  PaymentStatus,
  StudentStatus,
} from '@/types'

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  const styles: Record<EnrollmentStatus, string> = {
    approved: 'bg-accent/15 text-accent',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-destructive/10 text-destructive',
  }
  return (
    <Badge className={cn('capitalize', styles[status])} variant="ghost">
      {status}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    paid: 'bg-accent/15 text-accent',
    partial: 'bg-blue-100 text-blue-700',
    due: 'bg-destructive/10 text-destructive',
  }
  return (
    <Badge className={cn('capitalize', styles[status])} variant="ghost">
      {status}
    </Badge>
  )
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const styles: Record<StudentStatus, string> = {
    active: 'bg-accent/15 text-accent',
    inactive: 'bg-muted text-muted-foreground',
  }
  return (
    <Badge className={cn('capitalize', styles[status])} variant="ghost">
      {status}
    </Badge>
  )
}

export function NoticeCategoryBadge({ category }: { category: NoticeCategory }) {
  const styles: Record<NoticeCategory, string> = {
    general: 'bg-secondary text-secondary-foreground',
    exam: 'bg-blue-100 text-blue-700',
    event: 'bg-accent/15 text-accent',
    urgent: 'bg-destructive/10 text-destructive',
  }
  return (
    <Badge className={cn('capitalize', styles[category])} variant="ghost">
      {category}
    </Badge>
  )
}
