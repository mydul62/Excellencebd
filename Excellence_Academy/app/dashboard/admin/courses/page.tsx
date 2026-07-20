'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { getCourses } from '@/services'
import { updateCourse, deleteCourse, type ServerCourse } from '@/serverdata/courses'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

// ── Edit schema — mirrors PUT /api/courses/:id accepted fields ────────────────
const editSchema = z.object({
  title: z.string().trim().min(3, 'Course title is required'),
  category: z.string().trim().min(1, 'Category is required'),
  duration: z.string().trim().min(1, 'Duration is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  seats: z.coerce.number().min(1, 'Seats must be at least 1'),
  description: z.string().trim().min(10, 'Description is required'),
  teacherId: z.string().trim().optional(),
  popular: z.boolean().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<ServerCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<ServerCourse | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) as any })

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const fetchCourses = () => {
    setLoading(true)
    getCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCourses() }, [])

  // ── Open edit dialog ───────────────────────────────────────────────────────
  function openEdit(course: ServerCourse) {
    setEditTarget(course)
    reset({
      title: course.title,
      category: course.category,
      duration: course.duration,
      price: course.price,
      level: course.level,
      seats: course.seats,
      description: course.description,
      teacherId: course.teacherId ?? '',
      popular: course.popular ?? false,
    })
  }

  // ── Submit edit — PUT /api/courses/:id ─────────────────────────────────────
  async function onEditSubmit(values: EditFormValues) {
    if (!editTarget) return
    try {
      await updateCourse(editTarget.id, {
        title: values.title,
        slug: slugify(values.title),
        category: values.category,
        duration: values.duration,
        price: values.price,
        level: values.level,
        seats: values.seats,
        description: values.description,
        teacherId: values.teacherId || undefined,
        popular: values.popular,
      })
      toast.success('Course updated successfully')
      setEditTarget(null)
      fetchCourses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update course')
    }
  }

  // ── Delete — DELETE /api/courses/:id ──────────────────────────────────────
  async function handleDelete(course: ServerCourse) {
    const confirmed = confirm(
      `Delete course "${course.title}"? This cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingId(course.id)
    try {
      await deleteCourse(course.id)
      toast.success('Course deleted')
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete course')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />Course Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Courses</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review the current course catalog, edit details, and remove courses.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title={`Courses (${courses.length})`}
        description="All available courses."
        action={
          <Button render={<Link href="/dashboard/admin/courses/register" />}>
            <Plus className="mr-2 h-4 w-4" />Add Course
          </Button>
        }
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && courses.length === 0 && (
          <p className="text-sm text-muted-foreground">No courses found.</p>
        )}
        {!loading && !error && courses.length > 0 && (
          <DataTable
            columns={[
              {
                header: 'Course',
                accessor: (row) => (
                  <div>
                    <p className="font-medium text-foreground">{row.title}</p>
                    <p className="text-xs text-muted-foreground">{row.category}</p>
                  </div>
                ),
              },
              { header: 'Level', accessor: 'level' },
              { header: 'Duration', accessor: 'duration' },
              { header: 'Seats', accessor: 'seats' },
              { header: 'Price', accessor: (row) => `৳${row.price.toLocaleString()}` },
              {
                header: 'Rating',
                accessor: (row) => <Badge variant="secondary">{row.rating.toFixed(1)} ★</Badge>,
              },
              {
                header: 'Actions',
                accessor: (row) => (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      disabled={deletingId === row.id}
                      onClick={() => handleDelete(row)}
                    >
                      <Trash2 className="size-3 mr-1" />
                      {deletingId === row.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={courses}
          />
        )}
      </SectionCard>

      {/* ── Edit Dialog ── */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit as any)} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="c-title">Course Title</Label>
              <Input id="c-title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="c-category">Category</Label>
                <Input id="c-category" placeholder="UI / UX" {...register('category')} />
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-duration">Duration</Label>
                <Input id="c-duration" placeholder="8 weeks" {...register('duration')} />
                {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="c-price">Price (৳)</Label>
                <Input id="c-price" type="number" min={0} {...register('price')} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-seats">Seats</Label>
                <Input id="c-seats" type="number" min={1} {...register('seats')} />
                {errors.seats && <p className="text-sm text-destructive">{errors.seats.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="c-level">Level</Label>
              <select
                id="c-level"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
                {...register('level')}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.level && <p className="text-sm text-destructive">{errors.level.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="c-teacher">Teacher ID (optional)</Label>
              <Input id="c-teacher" placeholder="Teacher profile ID" {...register('teacherId')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="c-description">Description</Label>
              <Textarea id="c-description" rows={3} {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="c-popular"
                type="checkbox"
                className="size-4 rounded border-input"
                {...register('popular')}
              />
              <Label htmlFor="c-popular">Mark as popular</Label>
            </div>

            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
