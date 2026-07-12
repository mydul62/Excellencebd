import { getCourses } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'

export default async function AdminCoursesPage() {
  const courses = await getCourses()

  return (
    <SectionCard title="Courses" description="Review every available program and its delivery details.">
      <DataTable
        columns={[
          { header: 'Course', accessor: (row) => row.title },
          { header: 'Category', accessor: 'category' },
          { header: 'Level', accessor: 'level' },
          { header: 'Seats', accessor: 'seats' },
          { header: 'Price', accessor: (row) => `৳${row.price}` },
          { header: 'Rating', accessor: (row) => <Badge variant="secondary">{row.rating.toFixed(1)}</Badge> },
        ]}
        data={courses}
      />
    </SectionCard>
  )
}
