import { getTeacherDashboard } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function TeacherProfilePage() {
  const data = await getTeacherDashboard('t1')
  const teacher = data.teacher

  if (!teacher) {
    return null
  }

  return (
    <SectionCard title="Profile" description="Your teaching profile and credentials.">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Avatar size="lg">
          <AvatarImage src={teacher.avatar} alt={teacher.name} />
          <AvatarFallback>{teacher.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-semibold text-foreground">{teacher.name}</h2>
          <p className="text-sm text-muted-foreground">{teacher.subject} • {teacher.qualification}</p>
          <p className="text-sm text-muted-foreground">{teacher.bio}</p>
          <p className="text-sm text-muted-foreground">Experience: {teacher.experienceYears} years</p>
        </div>
      </div>
    </SectionCard>
  )
}
