import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#146373_0%,#010F3F_100%)] px-6 py-14 text-center text-white md:px-12 md:py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 className="font-display text-3xl font-bold text-balance md:text-4xl">
              আপনার শেখার যাত্রা শুরু করতে প্রস্তুত?
            </h2>

            <p className="text-pretty text-white/85 md:text-lg">
              Excellence Academic & Admission Coaching-এর সাথে যুক্ত হয়ে হাজারো
              সফল শিক্ষার্থীর কাতারে সামিল হন। আজই নিবন্ধন করুন এবং আপনার
              উজ্জ্বল ভবিষ্যতের প্রথম পদক্ষেপ নিন।
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                render={<Link href="/register" />}
                size="lg"
                variant="secondary"
                className="rounded-full bg-[#F9801D] text-white hover:bg-[#e56f15]"
              >
                এখনই নিবন্ধন করুন
                <ArrowRightIcon data-icon="inline-end" />
              </Button>

              <Button
                render={<Link href="/contact" />}
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                যোগাযোগ করুন
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
