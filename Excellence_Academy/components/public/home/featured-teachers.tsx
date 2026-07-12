import Link from "next/link"
import { teachers } from "@/data/teachers"
import { TeacherCard } from "@/components/cards/teacher-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

export function FeaturedTeachers() {
  const featured = teachers.slice(0, 4)

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="Our Faculty"
          title="Meet Our Expert Teachers"
          description="Dedicated educators committed to bringing out the best in every student."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button render={<Link href="/teachers" />} size="lg" variant="outline">
            View All Teachers
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
