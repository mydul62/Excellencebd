import { NoticeCard } from "@/components/cards/notice-card";
import { PageBanner } from "@/components/public/page-banner";
import { notices } from "@/data/notices";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "নোটিশ বোর্ড",
  description:
    "Excellence Academic & Admission Coaching-এর সর্বশেষ নোটিশ, ঘোষণা ও গুরুত্বপূর্ণ আপডেট সম্পর্কে জানুন।",
};

export default function NoticePage() {
  const publicNotices = notices
    .filter((n) => n.audience === "all" || n.audience === "students")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <PageBanner
        title="নোটিশ বোর্ড"
        description="শিক্ষার্থী ও অভিভাবকদের জন্য গুরুত্বপূর্ণ নোটিশ, ক্লাসের সময়সূচি এবং সর্বশেষ আপডেট।"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 md:px-6">
          {publicNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </section>
    </>
  );
}
