'use client'

import { useEffect, useState } from 'react'
import { NoticeCard } from '@/components/cards/notice-card'
import { PageBanner } from '@/components/public/page-banner'
import { getPublicNotices, type ServerNotice } from '@/serverdata/notices'

export default function NoticePage() {
  const [notices, setNotices] = useState<ServerNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPublicNotices()
      .then(setNotices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load notices'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageBanner
        title="নোটিশ বোর্ড"
        description="শিক্ষার্থী ও অভিভাবকদের জন্য গুরুত্বপূর্ণ নোটিশ, ক্লাসের সময়সূচি এবং সর্বশেষ আপডেট।"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto container w-[95%] flex flex-col gap-4 px-4 md:px-6">
          {loading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-muted-foreground">{error}</p>
          )}

          {!loading && !error && notices.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No notices available.</p>
          )}

          {!loading && !error && notices.length > 0 &&
            notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={{
                  id: notice.id,
                  title: notice.title,
                  content: notice.content,
                  category: notice.category as any,
                  audience: notice.audience as any,
                  date: notice.date,
                  author: notice.author,
                }}
              />
            ))}
        </div>
      </section>
    </>
  )
}
