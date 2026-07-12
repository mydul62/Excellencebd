"use client";

import { CourseCard } from "@/components/cards/course-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { courses } from "@/data/courses";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function PopularCourses() {
  const popular = courses.filter((c) => c.popular).slice(0, 4);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="আমাদের কোর্সসমূহ"
          title="আমাদের জনপ্রিয় কোর্সসমূহ"
          description="একাডেমিক সাফল্য ও দক্ষতা উন্নয়নের জন্য আমাদের সবচেয়ে জনপ্রিয় ও অধিক ভর্তি হওয়া কোর্সগুলো ঘুরে দেখুন।"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button render={<Link href="/courses" />} size="lg" variant="outline">
            সকল কোর্স দেখুন
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  );
}
