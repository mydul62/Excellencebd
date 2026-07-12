import { getCourses } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'

export default async function StudentBrowsePage() {
  const courses = await getCourses()

  return (
    <SectionCard title="Browse Courses" description="Explore the full catalog and pick your next learning track.">
      <DataTable
        columns={[
          { header: 'Course', accessor: (row) => row.title },
          { header: 'Category', accessor: 'category' },
          { header: 'Level', accessor: 'level' },
          { header: 'Price', accessor: (row) => formatCurrency(row.price) },
          { header: 'Rating', accessor: (row) => <Badge variant="secondary">{row.rating.toFixed(1)}</Badge> },
        ]}
        data={courses}
      />
    </SectionCard>
  )
}
