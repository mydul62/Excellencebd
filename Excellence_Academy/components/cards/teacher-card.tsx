import { Award, BookOpen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { initials } from '@/lib/format'
import type { Teacher } from '@/types'

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <Card className="group h-full rounded-2xl border border-[#E5E7EB] bg-white text-center shadow-[0_10px_30px_rgba(1,15,63,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(1,15,63,0.12)]">
      <CardContent className="flex flex-col items-center gap-3 p-6">
        <Avatar className="size-20 ring-2 ring-primary/10 ring-offset-2 ring-offset-card">
          <AvatarImage src={teacher.avatar || '/placeholder.svg'} alt={teacher.name} />
          <AvatarFallback>{initials(teacher.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-semibold text-foreground">{teacher.name}</h3>
          <Badge variant="secondary" className="mx-auto rounded-full border-[#146373]/20 bg-[#EAF2F4] text-[#0F5D73]">
            {teacher.subject}
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{teacher.bio}</p>
        <div className="mt-1 flex w-full items-center justify-center gap-4 border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Award className="size-3.5 text-primary" />
            {teacher.experienceYears}+ yrs
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-primary" />
            {teacher.courseIds.length} courses
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
