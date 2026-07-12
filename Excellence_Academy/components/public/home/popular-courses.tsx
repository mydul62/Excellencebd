"use client"

import Link from "next/link"
import { courses } from "@/data/courses"
import { CourseCard } from "@/components/cards/course-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

export function PopularCourses() {
  const popular = courses.filter((c) => c.popular).slice(0, 4)

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="Our Courses"
          title="Our Popular Courses"
          description="Explore our most enrolled programs designed to help you excel in academics and skills."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button render={<Link href="/courses" />} size="lg" variant="outline">
            View All Courses
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
