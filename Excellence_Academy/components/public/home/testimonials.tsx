'use client'

import { useEffect, useState } from 'react'
import { RatingStars } from '@/components/shared/rating-stars'
import { SectionHeading } from '@/components/shared/section-heading'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { QuoteIcon } from 'lucide-react'
import { getFeaturedTestimonials, type ServerReview } from '@/serverdata/testimonials'

export function Testimonials() {
  const [reviews, setReviews] = useState<ServerReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFeaturedTestimonials(3)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto w-[95%] px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) return null

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="শিক্ষার্থীদের মতামত"
          title="আমাদের শিক্ষার্থীরা যা বলছে"
          description="আমাদের প্রতিষ্ঠানের মাধ্যমে সফলতার পথে এগিয়ে যাওয়া শিক্ষার্থীদের বাস্তব অভিজ্ঞতা।"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="relative border-[#E5E7EB] bg-[#F6F8FB] shadow-[0_10px_30px_rgba(1,15,63,0.05)]"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <QuoteIcon className="size-8 text-[#F9801D]/20" />

                <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>

                <RatingStars rating={review.rating} />

                <div className="mt-2 flex items-center gap-3 border-t border-[#E5E7EB] pt-4">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={review.avatar ?? '/placeholder.svg'}
                      alt={review.name}
                    />
                    <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{review.name}</span>
                    <span className="text-xs text-muted-foreground">{review.role ?? ''}</span>
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
