'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Trash2, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  getCourseMaterials,
  uploadCourseMaterial,
  deleteCourseMaterial,
  getCourseMaterialDownloadUrl,
  type ServerCourseMaterial,
} from '@/serverdata/courseMaterials'
import { getMyCourses, type ServerTeacherCourse } from '@/serverdata/teachers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// ── Upload form schema ────────────────────────────────────────────────────────
const uploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
})

type UploadFormValues = z.infer<typeof uploadSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
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

// ─────────────────────────────────────────────────────────────────────────────
export default function TeacherMaterialsPage() {
  const [courses, setCourses] = useState<ServerTeacherCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [materials, setMaterials] = useState<ServerCourseMaterial[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({ resolver: zodResolver(uploadSchema) })

  // ── Load teacher's courses ────────────────────────────────────────────────
  useEffect(() => {
    setCoursesLoading(true)
    getMyCourses()
      .then((data) => {
        setCourses(data ?? [])
        if (data?.length) setSelectedCourseId(data[0].id)
      })
      .catch((e) => toast.error(e.message ?? 'Failed to load courses'))
      .finally(() => setCoursesLoading(false))
  }, [])

  // ── Load materials for selected course ────────────────────────────────────
  const fetchMaterials = useCallback(() => {
    if (!selectedCourseId) return
    setMaterialsLoading(true)
    getCourseMaterials(selectedCourseId)
      .then(setMaterials)
      .catch((e) => toast.error(e.message ?? 'Failed to load materials'))
      .finally(() => setMaterialsLoading(false))
  }, [selectedCourseId])

  useEffect(() => { fetchMaterials() }, [fetchMaterials])

  // ── Upload ────────────────────────────────────────────────────────────────
  async function onUpload(values: UploadFormValues) {
    if (!selectedCourseId) {
      toast.error('Please select a course first')
      return
    }
    if (!selectedFile) {
      toast.error('Please select a PDF file')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('courseId', selectedCourseId)
    formData.append('title', values.title)
    if (values.description) formData.append('description', values.description)

    try {
      await uploadCourseMaterial(formData)
      toast.success('Material uploaded successfully')
      reset()
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchMaterials()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(material: ServerCourseMaterial) {
    const confirmed = confirm(
      `Delete "${material.title}"? This cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingId(material.id)
    try {
      await deleteCourseMaterial(material.id)
      toast.success('Material deleted')
      setMaterials((prev) => prev.filter((m) => m.id !== material.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
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
              কোর্স ম্যাটেরিয়াল
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              কোর্স ম্যাটেরিয়াল আপলোড
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              আপনার কোর্সের শিক্ষার্থীদের জন্য PDF নোট, অ্যাসাইনমেন্ট ও স্টাডি ম্যাটেরিয়াল আপলোড করুন।
            </p>
          </div>
          <Button render={<Link href="/dashboard/teacher" />} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ড্যাশবোর্ড
            </Button>
        </div>
      </div>

      {/* ── Course selector ── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5">
        <Label htmlFor="course-select" className="mb-2 block text-sm font-medium">
          কোর্স নির্বাচন করুন
        </Label>
        {coursesLoading ? (
          <div className="h-9 w-64 animate-pulse rounded-xl bg-muted" />
        ) : courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            আপনাকে এখনো কোনো কোর্স অ্যাসাইন করা হয়নি।
          </p>
        ) : (
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="h-9 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:bg-background"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Upload form ── */}
      {selectedCourseId && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">নতুন ম্যাটেরিয়াল আপলোড</h2>
          <form onSubmit={handleSubmit(onUpload)} className="space-y-4">
            {/* Title */}
            <div className="grid gap-1.5">
              <Label htmlFor="mat-title">
                শিরোনাম <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mat-title"
                placeholder="যেমন: অধ্যায় ১ — নোট"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-1.5">
              <Label htmlFor="mat-desc">বিবরণ (ঐচ্ছিক)</Label>
              <Textarea
                id="mat-desc"
                rows={2}
                placeholder="সংক্ষিপ্ত বিবরণ লিখুন…"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* File picker */}
            <div className="grid gap-1.5">
              <Label>
                PDF ফাইল <span className="text-destructive">*</span>
              </Label>
              <label
                htmlFor="mat-file"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5 dark:bg-muted/10"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                {selectedFile ? (
                  <span className="text-sm font-medium text-foreground">
                    {selectedFile.name}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    ক্লিক করুন বা ড্র্যাগ করে PDF আপলোড করুন (সর্বোচ্চ 20 MB)
                  </span>
                )}
                <input
                  id="mat-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Upload className="h-4 w-4" />
              {isSubmitting ? 'আপলোড হচ্ছে…' : 'আপলোড করুন'}
            </Button>
          </form>
        </div>
      )}

      {/* ── Materials list ── */}
      {selectedCourseId && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">আপলোড করা ম্যাটেরিয়ালস</h2>

          {materialsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {!materialsLoading && materials.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-10 text-center">
              <FileText className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                এই কোর্সে এখনো কোনো ম্যাটেরিয়াল আপলোড করা হয়নি।
              </p>
            </div>
          )}

          {!materialsLoading && materials.length > 0 && (
            <ul className="space-y-3">
              {materials.map((mat) => (
                <li
                  key={mat.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 dark:bg-muted/10"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{mat.title}</p>
                      {mat.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {mat.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(mat.createdAt)}
                        {mat.fileSize ? ` · ${formatBytes(mat.fileSize)}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={getCourseMaterialDownloadUrl(mat.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium text-foreground shadow-sm transition-colors hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
                    >
                      <Download className="h-3 w-3" />
                      ডাউনলোড
                    </a>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 gap-1 px-2 text-xs"
                      disabled={deletingId === mat.id}
                      onClick={() => handleDelete(mat)}
                    >
                      <Trash2 className="h-3 w-3" />
                      {deletingId === mat.id ? 'মুছছে…' : 'মুছুন'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
