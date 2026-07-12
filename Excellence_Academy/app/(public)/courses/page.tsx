import type { Metadata } from "next"
import { PageBanner } from "@/components/public/page-banner"
import { CoursesBrowser } from "@/components/public/courses-browser"

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse our wide range of academic, skill, language, and science courses at Bright Future.",
}

export default function CoursesPage() {
  return (
    <>
      <PageBanner
        title="Explore Our Courses"
        description="Find the perfect program to match your goals, from academics to professional skills."
      />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <CoursesBrowser />
        </div>
      </section>
    </>
  )
}
