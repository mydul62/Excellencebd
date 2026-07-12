'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

const highlights = [
  'অভিজ্ঞ শিক্ষক',
  'সুবিধাজনক ব্যাচ',
  'সাফল্যের প্রমাণিত ইতিহাস',
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto w-[95%] grid gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-end lg:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="size-2 rounded-full bg-accent" />
            নতুন ব্যাচে ভর্তি চলছে
          </span>

          {/* Heading */}
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            আজকের শিক্ষা,
            <br />
            <span className="text-primary">আগামীর নেতৃত্ব</span>
          </h1>

          {/* Description */}
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            দক্ষ ও অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে মানসম্মত শিক্ষা, নিয়মিত
            পরীক্ষা, ব্যক্তিগত যত্ন এবং আধুনিক শিক্ষার পরিবেশের মাধ্যমে আমরা
            শিক্ষার্থীদের উজ্জ্বল ভবিষ্যৎ গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button render={<Link href="/courses" />} className="h-11 px-5 text-sm">
              সকল কোর্স দেখুন
              <ArrowRight data-icon="inline-end" />
            </Button>

            <Button
              render={<Link href="/contact" />}
              variant="outline"
              className="h-11 px-5 text-sm"
            >
              <Phone data-icon="inline-start" />
              যোগাযোগ করুন
            </Button>
          </div>

          {/* Highlights */}
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <CheckCircle2 className="size-4 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative flex items-end justify-center"
        >
          <div className="overflow-hidden rounded-3xl">
            <Image
              src="/st.png"
              alt="Excellence Academic & Admission Coaching"
              width={820}
              height={700}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}