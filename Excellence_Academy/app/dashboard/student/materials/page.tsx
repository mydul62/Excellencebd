'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

import {
  getCourseMaterials,
  getCourseMaterialDownloadUrl,
  type ServerCourseMaterial,
} from '@/serverdata/courseMaterials'
import {
  getMyEnrollments,
  type ServerEnrollment,
} from '@/serverdata/enrollments'
import { Button } from '@/components/ui/button'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface CourseWithMaterials {
  courseId: string
  courseTitle: string
  materials: ServerCourseMaterial[]
  loading: boolean
  open: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
export default function StudentMaterialsPage() {
  const [courseSections, setCourseSections] = useState<CourseWithMaterials[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  // ── Load approved enrollments then fetch materials for each course ─────────
  useEffect(() => {
    setPageLoading(true)
    getMyEnrollments({ enrollmentStatus: 'approved', limit: 100 })
      .then(({ data }) => {
        // Deduplicate by courseId (a student could theoretically have one per course)
        const seen = new Set<string>()
        const unique = data.filter((e: ServerEnrollment) => {
          if (seen.has(e.courseId)) return false
          seen.add(e.courseId)
          return true
        })

        const sections: CourseWithMaterials[] = unique.map((e) => ({
          courseId: e.courseId,
          courseTitle: e.course?.title ?? e.courseId,
          materials: [],
          loading: true,
          // First section open by default
          open: false,
        }))

        if (sections.length > 0) sections[0].open = true
        setCourseSections(sections)

        // Fetch materials for each enrolled course in parallel
        sections.forEach((section) => {
          getCourseMaterials(section.courseId)
            .then((mats) => {
              setCourseSections((prev) =>
                prev.map((s) =>
                  s.courseId === section.courseId
                    ? { ...s, materials: mats, loading: false }
                    : s,
                ),
              )
            })
            .catch(() => {
              setCourseSections((prev) =>
                prev.map((s) =>
                  s.courseId === section.courseId
                    ? { ...s, loading: false }
                    : s,
                ),
              )
            })
        })
      })
      .catch((e) => toast.error(e.message ?? 'Failed to load enrollments'))
      .finally(() => setPageLoading(false))
  }, [])

  function toggleSection(courseId: string) {
    setCourseSections((prev) =>
      prev.map((s) =>
        s.courseId === courseId ? { ...s, open: !s.open } : s,
      ),
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <FileText className="h-4 w-4" />
              স্টাডি ম্যাটেরিয়ালস
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              কোর্স ম্যাটেরিয়ালস
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              আপনার এনরোল করা কোর্সগুলোর PDF নোট, অ্যাসাইনমেন্ট ও স্টাডি ম্যাটেরিয়াল এখানে পাওয়া যাবে।
            </p>
          </div>
          <Button render={<Link href="/dashboard/student" />} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ড্যাশবোর্ড
            </Button>
        </div>
      </div>

      {/* ── Full-page skeleton ── */}
      {pageLoading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      )}

      {/* ── No approved enrollments ── */}
      {!pageLoading && courseSections.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">
            আপনি এখনো কোনো কোর্সে এনরোল করেননি।
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            অনুমোদিত এনরোলমেন্ট থাকলে কোর্স ম্যাটেরিয়াল এখানে দেখাবে।
          </p>
          <Button render={<Link href="/dashboard/student/browse" />} variant="outline" className="mt-4">
            কোর্স ব্রাউজ করুন
          </Button>
        </div>
      )}

      {/* ── Course sections ── */}
      {!pageLoading &&
        courseSections.map((section) => (
          <div
            key={section.courseId}
            className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
          >
            {/* Section header — click to toggle */}
            <button
              type="button"
              onClick={() => toggleSection(section.courseId)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/30"
              aria-expanded={section.open}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {section.courseTitle}
                  </p>
                  {!section.loading && (
                    <p className="text-xs text-muted-foreground">
                      {section.materials.length === 0
                        ? 'কোনো ম্যাটেরিয়াল নেই'
                        : `${section.materials.length}টি ম্যাটেরিয়াল`}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`text-muted-foreground transition-transform duration-200 ${section.open ? 'rotate-180' : ''}`}
                aria-hidden
              >
                ▾
              </span>
            </button>

            {/* Collapsible content */}
            {section.open && (
              <div className="border-t border-border/40 px-5 pb-5 pt-4">
                {/* Loading skeleton */}
                {section.loading && (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-xl bg-muted"
                      />
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!section.loading && section.materials.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 py-8 text-center">
                    <FileText className="mb-2 h-7 w-7 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      এই কোর্সে এখনো কোনো ম্যাটেরিয়াল আপলোড করা হয়নি।
                    </p>
                  </div>
                )}

                {/* Materials list */}
                {!section.loading && section.materials.length > 0 && (
                  <ul className="space-y-2">
                    {section.materials.map((mat) => (
                      <li
                        key={mat.id}
                        className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 dark:bg-muted/10"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {mat.title}
                            </p>
                            {mat.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {mat.description}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(mat.createdAt)}
                              {mat.fileSize
                                ? ` · ${formatBytes(mat.fileSize)}`
                                : ''}
                            </p>
                          </div>
                        </div>

                        <a
                          href={getCourseMaterialDownloadUrl(mat.id)}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          <Download className="h-3 w-3" />
                          ডাউনলোড
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
