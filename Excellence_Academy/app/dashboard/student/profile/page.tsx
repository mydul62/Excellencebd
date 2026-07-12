import { getStudentDashboard } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function StudentProfilePage() {
  const data = await getStudentDashboard('s1')
  const student = data.student

  if (!student) {
    return null
  }

  return (
    <SectionCard title="Profile" description="Your student profile and contact information.">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Avatar size="lg">
          <AvatarImage src={student.avatar} alt={student.name} />
          <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-semibold text-foreground">{student.name}</h2>
          <p className="text-sm text-muted-foreground">{student.email}</p>
          <p className="text-sm text-muted-foreground">{student.phone}</p>
          <p className="text-sm text-muted-foreground">Guardian: {student.guardian}</p>
          <p className="text-sm text-muted-foreground">Address: {student.address}</p>
        </div>
      </div>
    </SectionCard>
  )
}
