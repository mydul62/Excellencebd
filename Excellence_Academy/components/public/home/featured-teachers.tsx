import { TeacherCard } from "@/components/cards/teacher-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { teachers } from "@/data/teachers";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function FeaturedTeachers() {
  const featured = teachers.slice(0, 4);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="আমাদের শিক্ষকবৃন্দ"
          title="আমাদের অভিজ্ঞ ও দক্ষ শিক্ষকগণের সাথে পরিচিত হোন"
          description="দক্ষ, অভিজ্ঞ ও আন্তরিক শিক্ষকবৃন্দ প্রতিটি শিক্ষার্থীর সর্বোচ্চ সাফল্য নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ।"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            render={<Link href="/teachers" />}
            size="lg"
            variant="outline"
          >
            সকল শিক্ষক দেখুন
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  );
}
