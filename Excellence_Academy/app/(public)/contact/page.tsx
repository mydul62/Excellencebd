import type { Metadata } from "next"
import { PageBanner } from "@/components/public/page-banner"
import { ContactForm } from "@/components/public/contact-form"
import { Card, CardContent } from "@/components/ui/card"
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Bright Future Coaching Center. We are here to help you.",
}

const info = [
  { icon: MapPinIcon, label: "Address", value: "House 12, Road 5, Dhanmondi, Dhaka 1205" },
  { icon: PhoneIcon, label: "Phone", value: "+880 1712-345678" },
  { icon: MailIcon, label: "Email", value: "info@brightfuture.edu.bd" },
  { icon: ClockIcon, label: "Office Hours", value: "Sat - Thu: 9:00 AM - 8:00 PM" },
]

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Get In Touch"
        description="Have questions about admissions, courses, or schedules? We would love to hear from you."
      />
      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {info.map((item) => (
              <Card key={item.label} className="border-border/60">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
