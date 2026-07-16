'use client'

import { useState, useEffect, useMemo } from 'react'
import { CourseCard } from '@/components/cards/course-card'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { SearchIcon, BookXIcon } from 'lucide-react'
import { getCourses, type ServerCourse } from '@/serverdata/courses'

export function CoursesBrowser() {
  const [courses, setCourses] = useState<ServerCourse[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')

  useEffect(() => {
    getCourses({ limit: 100 })
      .then(({ data }) => {
        setCourses(data)
        // Build unique category list from results
        const unique = Array.from(new Set(data.map((c) => c.category)))
        setCategories(['All', ...unique])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesQuery =
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'All' || course.category === category
      return matchesQuery && matchesCategory
    })
  }, [courses, query, category])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <ToggleGroup
          value={[category]}
          onValueChange={(value) => setCategory(value[0] ?? 'All')}
          className="flex-wrap"
        >
          {categories.map((cat) => (
            <ToggleGroupItem key={cat} value={cat}>
              {cat}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><BookXIcon /></EmptyMedia>
            <EmptyTitle>Could not load courses</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><BookXIcon /></EmptyMedia>
            <EmptyTitle>No courses found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search or filter to find what you are looking for.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={{ ...course, teacher: undefined }} />
          ))}
        </div>
      )}
    </div>
  )
}
