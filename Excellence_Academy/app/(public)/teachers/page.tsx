import { TeacherCard } from "@/components/cards/teacher-card";
import { PageBanner } from "@/components/public/page-banner";
import { teachers } from "@/data/teachers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "শিক্ষকবৃন্দ",
  description:
    "Bright Future Coaching Center-এর অভিজ্ঞ, দক্ষ ও নিবেদিতপ্রাণ শিক্ষকবৃন্দের সাথে পরিচিত হোন।",
};

export default function TeachersPage() {
  return (
    <>
      <PageBanner
        title="আমাদের অভিজ্ঞ শিক্ষকবৃন্দ"
        description="দক্ষ, অভিজ্ঞ ও আন্তরিক শিক্ষকবৃন্দ প্রতিটি শিক্ষার্থীকে তার লক্ষ্যে পৌঁছাতে সর্বদা প্রতিশ্রুতিবদ্ধ।"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
