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
    <Card className="group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
        <Button render={<Link href={`/courses/${course.slug}`} />} size="sm" variant="outline">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
