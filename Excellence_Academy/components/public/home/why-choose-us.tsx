import { SectionHeading } from "@/components/shared/section-heading"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCapIcon, UsersIcon, ClockIcon, AwardIcon, BookOpenCheckIcon, HeartHandshakeIcon } from "lucide-react"

const features = [
  {
    icon: GraduationCapIcon,
    title: "Expert Teachers",
    description: "Learn from experienced educators with proven track records and deep subject knowledge.",
  },
  {
    icon: UsersIcon,
    title: "Small Batch Size",
    description: "Personalized attention with limited students per batch for better learning outcomes.",
  },
  {
    icon: ClockIcon,
    title: "Flexible Timing",
    description: "Morning and evening batches available to fit your busy schedule perfectly.",
  },
  {
    icon: AwardIcon,
    title: "Proven Results",
    description: "Consistent top grades and success stories from thousands of our students.",
  },
  {
    icon: BookOpenCheckIcon,
    title: "Quality Materials",
    description: "Comprehensive study materials, notes, and regular practice tests included.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Student Support",
    description: "Dedicated mentorship and doubt-clearing sessions whenever you need help.",
  },
]

export function WhyChooseUs() {
  return (
    <section className="bg-secondary/50 py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Everything You Need to Succeed"
          description="We provide a complete learning ecosystem built around your growth and success."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/60">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-6" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
