"use client"

import { useState, useMemo } from "react"
import { courses } from "@/data/courses"
import { CourseCard } from "@/components/cards/course-card"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { SearchIcon, BookXIcon } from "lucide-react"

const categories = ["All", "Academic", "Skill", "Language", "Science"] as const

export function CoursesBrowser() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("All")

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesQuery =
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === "All" || course.category === category
      return matchesQuery && matchesCategory
    })
  }, [query, category])

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
          onValueChange={(value) => setCategory(value[0] ?? "All")}
          className="flex-wrap"
        >
          {categories.map((cat) => (
            <ToggleGroupItem key={cat} value={cat}>
              {cat}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookXIcon />
            </EmptyMedia>
            <EmptyTitle>No courses found</EmptyTitle>
            <EmptyDescription>Try adjusting your search or filter to find what you are looking for.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
