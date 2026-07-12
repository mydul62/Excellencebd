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
    <section className="relative overflow-hidden bg-[#010F3F]">
      <div className="absolute inset-0 opacity-25">
        <div className="absolute left-[-5%] top-0 h-40 w-40 rounded-full border border-[#233943]" />
        <div className="absolute bottom-10 right-0 h-56 w-56 rounded-full border border-[#233943]" />
      </div>
      <div className="container mx-auto grid w-[95%] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-end lg:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#233943] bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
            <span className="size-2 rounded-full bg-[#F9801D]" />
            নতুন ব্যাচে ভর্তি চলছে
          </span>

          {/* Heading */}
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
            আজকের শিক্ষা,
            <br />
            <span className="text-[#F9801D]">আগামীর নেতৃত্ব</span>
          </h1>

          {/* Description */}
          <p className="max-w-lg text-lg leading-relaxed text-white/90">
            দক্ষ ও অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে মানসম্মত শিক্ষা, নিয়মিত
            পরীক্ষা, ব্যক্তিগত যত্ন এবং আধুনিক শিক্ষার পরিবেশের মাধ্যমে আমরা
            শিক্ষার্থীদের উজ্জ্বল ভবিষ্যৎ গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button render={<Link href="/courses" />} className="h-11 rounded-full bg-[#146373] px-5 text-sm text-white hover:bg-[#0F5D73]">
              সকল কোর্স দেখুন
              <ArrowRight data-icon="inline-end" />
            </Button>

            <Button
              render={<Link href="/contact" />}
              variant="outline"
              className="h-11 rounded-full border-white/20 bg-white/10 px-5 text-sm text-white hover:bg-white/20"
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
                className="flex items-center gap-2 text-sm font-medium text-white/90"
              >
                <CheckCircle2 className="size-4 text-[#F9801D]" />
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