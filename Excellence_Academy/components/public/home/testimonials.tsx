import { reviews } from "@/data/reviews"
import { SectionHeading } from "@/components/shared/section-heading"
import { RatingStars } from "@/components/shared/rating-stars"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QuoteIcon } from "lucide-react"

export function Testimonials() {
  const featured = reviews.filter((r) => r.featured).slice(0, 3)

  return (
    <section className="bg-secondary/50 py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Students Say"
          description="Real stories from students who transformed their futures with us."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featured.map((review) => (
            <Card key={review.id} className="relative border-border/60">
              <CardContent className="flex flex-col gap-4 p-6">
                <QuoteIcon className="size-8 text-primary/20" />
                <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>
                <RatingStars rating={review.rating} size="sm" />
                <div className="mt-2 flex items-center gap-3 border-t border-border pt-4">
                  <Avatar className="size-10">
                    <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                    <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{review.name}</span>
                    <span className="text-xs text-muted-foreground">{review.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
