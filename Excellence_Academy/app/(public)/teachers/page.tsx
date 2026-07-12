import type { Metadata } from "next"
import { teachers } from "@/data/teachers"
import { PageBanner } from "@/components/public/page-banner"
import { TeacherCard } from "@/components/cards/teacher-card"

export const metadata: Metadata = {
  title: "Teachers",
  description: "Meet the experienced and dedicated faculty at Bright Future Coaching Center.",
}

export default function TeachersPage() {
  return (
    <>
      <PageBanner
        title="Our Expert Teachers"
        description="Passionate educators dedicated to helping every student achieve their goals."
      />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
