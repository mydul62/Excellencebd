'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RatingStars } from '@/components/shared/rating-stars'
import { SectionHeading } from '@/components/shared/section-heading'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto w-[95%] px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) return null

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-white via-blue-50 to-white">

      {/* Background Glow */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />


      <div className="relative container mx-auto w-[95%] px-4 md:px-6">

        <SectionHeading
          eyebrow="শিক্ষার্থীদের মতামত"
          title="আমাদের শিক্ষার্থীরা যা বলছে"
          description="আমাদের প্রতিষ্ঠানের মাধ্যমে সফলতার পথে এগিয়ে যাওয়া শিক্ষার্থীদের বাস্তব অভিজ্ঞতা।"
        />


        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">

          {reviews.map((review, index) => (

            <motion.div
              key={review.id}
              initial={{
                opacity:0,
                y:40
              }}
              whileInView={{
                opacity:1,
                y:0
              }}
              viewport={{
                once:true
              }}
              transition={{
                duration:0.5,
                delay:index * 0.15
              }}

              whileHover={{
                y:-8,
                scale:1.03
              }}
            >

              <div
                className="
                relative h-full rounded-3xl
                border border-white/50
                bg-white/70
                backdrop-blur-xl
                p-1
                shadow-[0_20px_50px_rgba(37,99,235,0.12)]
                "
              >

                <div
                  className="
                  relative rounded-3xl
                  bg-white
                  p-6
                  overflow-hidden
                  "
                >

                  {/* Quote */}
                  <div
                    className="
                    absolute right-5 top-5
                    flex h-12 w-12 items-center justify-center
                    rounded-full
                    bg-blue-50
                    "
                  >
                    <QuoteIcon
                      className="
                      size-6
                      text-blue-500/40
                      "
                    />
                  </div>


                  <p className="
                    mt-5
                    text-sm
                    leading-relaxed
                    text-gray-600
                    min-h-[80px]
                  ">
                    "{review.comment}"
                  </p>


                  <div className="mt-5">
                    <RatingStars rating={review.rating}/>
                  </div>


                  <div
                    className="
                    mt-6
                    flex items-center gap-4
                    border-t
                    pt-5
                    "
                  >

                    <Avatar className="size-12 ring-2 ring-blue-100">

                      <AvatarImage
                        src={review.avatar ?? '/placeholder.svg'}
                        alt={review.name}
                      />

                      <AvatarFallback>
                        {review.name.charAt(0)}
                      </AvatarFallback>

                    </Avatar>


                    <div>

                      <h4 className="
                        text-sm
                        font-bold
                        text-gray-900
                      ">
                        {review.name}
                      </h4>


                      <p className="
                        text-xs
                        text-gray-500
                      ">
                        {review.role ?? 'Student'}
                      </p>

                    </div>

                  </div>


                </div>

              </div>


            </motion.div>

          ))}

        </div>

      </div>

    </section>
  )
}