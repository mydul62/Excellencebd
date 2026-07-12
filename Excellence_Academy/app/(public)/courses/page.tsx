import { CoursesBrowser } from "@/components/public/courses-browser";
import { PageBanner } from "@/components/public/page-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "কোর্সসমূহ",
  description:
    "Bright Future Coaching Center-এর একাডেমিক, দক্ষতা উন্নয়ন, ভাষা শিক্ষা এবং বিজ্ঞান বিষয়ক বিভিন্ন কোর্স সম্পর্কে জানুন।",
};

export default function CoursesPage() {
  return (
    <>
      <PageBanner
        title="আমাদের কোর্সসমূহ"
        description="আপনার লক্ষ্য ও আগ্রহ অনুযায়ী একাডেমিক শিক্ষা থেকে শুরু করে পেশাগত দক্ষতা উন্নয়নের জন্য উপযুক্ত কোর্স নির্বাচন করুন।"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <CoursesBrowser />
        </div>
      </section>
    </>
  );
}
