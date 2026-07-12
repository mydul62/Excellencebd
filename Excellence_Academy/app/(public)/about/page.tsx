import type { Metadata } from "next"
import { PageBanner } from "@/components/public/page-banner"
import { StatsBand } from "@/components/public/home/stats-band"
import { Card, CardContent } from "@/components/ui/card"
import { TargetIcon, EyeIcon, HeartIcon, CheckCircle2Icon } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Bright Future Coaching Center, our mission, vision, and commitment to student success.",
}

const values = [
  {
    icon: TargetIcon,
    title: "Our Mission",
    description:
      "To provide accessible, high-quality education that empowers every student to reach their full potential and achieve academic excellence.",
  },
  {
    icon: EyeIcon,
    title: "Our Vision",
    description:
      "To be the most trusted coaching center, shaping confident learners and future leaders through innovative teaching methods.",
  },
  {
    icon: HeartIcon,
    title: "Our Values",
    description:
      "Integrity, dedication, and student-first thinking guide everything we do. We believe in nurturing both knowledge and character.",
  },
]

const highlights = [
  "Experienced and certified faculty members",
  "Modern classrooms with digital learning tools",
  "Regular assessments and progress tracking",
  "Personalized attention with small batches",
  "Comprehensive study materials and resources",
  "Proven track record of student success",
]

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About Bright Future"
        description="For over 12 years, we have been dedicated to transforming students into confident achievers through quality education."
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title} className="border-border/60">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <value.icon className="size-6" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">{value.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-3xl font-bold text-balance text-foreground">
              Why Students & Parents Trust Us
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              At Bright Future Coaching Center, we combine experienced educators, a supportive environment, and a
              results-driven approach to help every student thrive academically and personally.
            </p>
            <ul className="flex flex-col gap-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-accent" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <img
              src="/students-studying-together-in-a-modern-classroom.png"
              alt="Students learning in a modern classroom at Bright Future Coaching Center"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <StatsBand />
    </>
  )
}
