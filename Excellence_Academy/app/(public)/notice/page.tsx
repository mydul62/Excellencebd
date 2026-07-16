'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Megaphone,
  Calendar,
  Filter,
  Sparkles,
} from 'lucide-react'

import { NoticeCard } from '@/components/cards/notice-card'
import { PageBanner } from '@/components/public/page-banner'

import {
  getPublicNotices,
  type ServerNotice,
} from '@/serverdata/notices'

export default function NoticePage() {
  const [notices, setNotices] = useState<ServerNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [audience, setAudience] = useState('all')

  useEffect(() => {
    getPublicNotices()
      .then(setNotices)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load notices'
        )
      )
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    return [
      'all',
      ...new Set(
        notices
          .map((n) => n.category)
          .filter(Boolean)
      ),
    ]
  }, [notices])

  const audiences = useMemo(() => {
    return [
      'all',
      ...new Set(
        notices
          .map((n) => n.audience)
          .filter(Boolean)
      ),
    ]
  }, [notices])

  const filtered = useMemo(() => {
    return notices.filter((notice) => {
      const titleMatches = notice.title?.toLowerCase().includes(search.toLowerCase()) ?? false
      const contentMatches = notice.content?.toLowerCase().includes(search.toLowerCase()) ?? false
      const matchesSearch = titleMatches || contentMatches

      const matchesCategory =
        category === 'all' ||
        notice.category === category

      const matchesAudience =
        audience === 'all' ||
        notice.audience === audience

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAudience
      )
    })
  }, [
    notices,
    search,
    category,
    audience,
  ])

  const featured = filtered.length > 0 ? filtered[0] : null

  return (
    <>
      <PageBanner
        title="Notice Board"
        description="Stay updated with the latest announcements, academic notices, admission updates and important information."
      />

      <section className="relative py-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#146373]/5 via-white to-white" />

        <div className="container mx-auto w-[95%] max-w-7xl">
          {/* Hero */}
       

          {/* Search & Filter */}
          <div className="mb-10 rounded-3xl border bg-white p-6 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notice..."
                  className="h-12 w-full rounded-xl border pl-12 outline-none transition focus:border-[#146373]"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12 rounded-xl border px-4 outline-none focus:border-[#146373]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="h-12 rounded-xl border px-4 outline-none focus:border-[#146373]"
              >
          {audiences.map((item, index) => (
  <option key={`${item}-${index}`} value={item}>
    {item}
  </option>
))}
              </select>
            </div>
          </div>

          {/* Featured Notice */}
          {featured && !loading && (
            <div className="mb-10 overflow-hidden rounded-[32px] border bg-white shadow-lg">
              <div className="grid lg:grid-cols-5">
                <div className="flex items-center justify-center bg-gradient-to-br from-[#146373] to-[#0F5D73] p-10 text-white">
                  <div className="text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                      <Megaphone className="h-10 w-10" />
                    </div>
                    <p className="text-sm uppercase tracking-widest text-white/70">
                      Featured Notice
                    </p>
                  </div>
                </div>

                <div className="p-8 lg:col-span-4">
                  <div className="mb-3 inline-flex rounded-full bg-[#146373]/10 px-3 py-1 text-xs font-semibold text-[#146373]">
                    {featured.category}
                  </div>

                  <h2 className="text-3xl font-bold text-[#0F5D73]">
                    {featured.title}
                  </h2>

                  <p className="mt-5 line-clamp-4 text-slate-600">
                    {featured.content}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {featured.date}
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1">
                      {featured.audience}
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1">
                      {featured.author}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          {!loading && (
    <div className="hidden lg:grid mb-10 gap-6 grid-cols-3">
              <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm text-slate-500">Total Notices</p>
                <h3 className="mt-3 text-4xl font-bold text-[#146373]">
                  {filtered.length}
                </h3>
              </div>

              <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm text-slate-500">Categories</p>
                <h3 className="mt-3 text-4xl font-bold text-[#146373]">
                  {categories.length - 1}
                </h3>
              </div>

              <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm text-slate-500">Audiences</p>
                <h3 className="mt-3 text-4xl font-bold text-[#146373]">
                  {audiences.length - 1}
                </h3>
              </div>
            </div>
          )}

          {/* Recent Notices */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-[#0F5D73]">
              Recent Notices
            </h2>

            <div className="flex items-center gap-2 rounded-full bg-[#146373]/10 px-4 py-2 text-sm text-[#146373]">
              <Filter className="h-4 w-4" />
              {filtered.length} Results
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-3xl bg-slate-100"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed p-20 text-center">
              <Search className="mx-auto mb-4 h-14 w-14 text-slate-400" />
              <h3 className="text-2xl font-semibold">No Notice Found</h3>
              <p className="mt-3 text-slate-500">
                Try changing the search keyword or filters.
              </p>
            </div>
          )}

          {/* Notice List */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid gap-6">
              {filtered.map((notice, index) => (
                <div
                  key={notice.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#146373]/20 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
                    {/* Left Date */}
                    <div className="flex shrink-0 flex-col items-center rounded-2xl bg-[#146373]/10 px-6 py-5">
                      <Calendar className="mb-2 h-6 w-6 text-[#146373]" />
                      <span className="text-sm font-semibold text-[#146373]">
                        {notice.date}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        {index < 3 && (
                          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                            NEW
                          </span>
                        )}

                        <span className="rounded-full bg-[#146373]/10 px-3 py-1 text-xs font-semibold text-[#146373]">
                          {notice.category}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                          {notice.audience}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-[#0F5D73] transition group-hover:text-[#146373]">
                        {notice.title}
                      </h3>

                      <p className="mt-4 line-clamp-3 leading-7 text-slate-600">
                        {notice.content}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-sm text-slate-500">
                          Published by
                          <span className="ml-2 font-semibold text-[#146373]">
                            {notice.author}
                          </span>
                        </div>

                       
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}