import type { Metadata } from "next"
import { notices } from "@/data/notices"
import { PageBanner } from "@/components/public/page-banner"
import { NoticeCard } from "@/components/cards/notice-card"

export const metadata: Metadata = {
  title: "Notice Board",
  description: "Stay updated with the latest notices, announcements, and events from Bright Future.",
}

export default function NoticePage() {
  const publicNotices = notices
    .filter((n) => n.audience === "all" || n.audience === "students")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <>
      <PageBanner
        title="Notice Board"
        description="Important announcements, schedules, and updates for our students and parents."
      />
      <section className="py-16 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 md:px-6">
          {publicNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </section>
    </>
  )
}
