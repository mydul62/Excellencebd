import Link from 'next/link'
import { Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { RatingStars } from '@/components/shared/rating-stars'
import { getCourseIcon } from '@/lib/course-icons'
import { formatCurrency } from '@/lib/format'
import type { CourseWithTeacher } from '@/services'

export function CourseCard({ course }: { course: CourseWithTeacher }) {
  const Icon = getCourseIcon(course.icon)
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(1,15,63,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(1,15,63,0.12)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl bg-[#EAF2F4] text-[#146373] transition-colors group-hover:bg-[#146373] group-hover:text-white">
          <Icon className="size-6" />
        </span>
        <Badge variant="secondary">{course.category}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-semibold text-foreground">{course.title}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        </div>
        <RatingStars rating={course.rating} showValue />
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {course.seats} seats
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t">
        <span className="font-display text-xl font-bold text-primary">
          {formatCurrency(course.price)}
        </span>
        <Button render={<Link href={`/courses/${course.slug}`} />} size="sm" className="rounded-full border-[#146373] bg-white text-[#146373] hover:bg-[#146373] hover:text-white">
          বিস্তারিত
        </Button>
      </CardFooter>
    </Card>
  )
}
