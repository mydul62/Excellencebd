import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground md:px-12 md:py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 className="font-display text-3xl font-bold text-balance md:text-4xl">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-pretty text-primary-foreground/85 md:text-lg">
              Join thousands of successful students at Bright Future Coaching Center. Register today and take the first
              step toward a brighter tomorrow.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button render={<Link href="/register" />} size="lg" variant="secondary">
                Register Now
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button
                render={<Link href="/contact" />}
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
