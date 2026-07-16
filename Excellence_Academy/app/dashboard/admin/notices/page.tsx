'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BellRing, Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  getNotices,
  updateNotice,
  deleteNotice,
  type ServerNotice,
  type NoticeCategory,
  type NoticeAudience,
} from '@/serverdata/notices'
import { SectionCard } from '@/components/dashboard/section-card'
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
import { formatDate } from '@/lib/format'
import { useAuth } from '@/hooks/use-auth'

// ── Edit schema ───────────────────────────────────────────────────────────────
const editSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  content: z.string().trim().min(8, 'Content is required'),
  category: z.enum(['general', 'academic', 'exam', 'holiday', 'event']),
  audience: z.enum(['all', 'students', 'teachers', 'parents']),
})

type EditFormValues = z.infer<typeof editSchema>

const CATEGORY_VARIANT: Record<NoticeCategory, 'default' | 'destructive' | 'secondary'> = {
  general: 'secondary',
  academic: 'default',
  exam: 'destructive',
  holiday: 'secondary',
  event: 'default',
}

export default function AdminNoticesPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<ServerNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<ServerNotice | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotices = () => {
    setLoading(true)
    getNotices({ limit: 100 })
      .then((res) =>
        setNotices(
          [...res.data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotices() }, [])

  // ── Open edit dialog ───────────────────────────────────────────────────────
  function openEdit(notice: ServerNotice) {
    setEditTarget(notice)
    reset({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      audience: notice.audience,
    })
  }

  // ── Submit edit — PUT /api/notices/:id ─────────────────────────────────────
  async function onEditSubmit(values: EditFormValues) {
    if (!editTarget) return
    try {
      await updateNotice(editTarget.id, {
        title: values.title,
        content: values.content,
        category: values.category,
        audience: values.audience,
        author: editTarget.author,   // keep original author
        date: editTarget.date,       // keep original publish date
      })
      toast.success('Notice updated successfully')
      setEditTarget(null)
      fetchNotices()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update notice')
    }
  }

  // ── Delete — DELETE /api/notices/:id ──────────────────────────────────────
  async function handleDelete(notice: ServerNotice) {
    const confirmed = confirm(
      `Delete notice "${notice.title}"? This cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingId(notice.id)
    try {
      await deleteNotice(notice.id)
      toast.success('Notice deleted')
      setNotices((prev) => prev.filter((n) => n.id !== notice.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete notice')
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
              <BellRing className="h-4 w-4" />Notice Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Notice Center</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Publish, edit, and remove notices for students and teachers.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title={`Notices (${notices.length})`}
        description="All published notices, newest first."
        action={
          <Button render={<Link href="/dashboard/admin/notices/register" />}>
            <Plus className="mr-2 h-4 w-4" />Publish Notice
          </Button>
        }
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && notices.length === 0 && (
          <p className="text-sm text-muted-foreground">No notices yet.</p>
        )}
        {!loading && !error && notices.length > 0 && (
          <div className="flex flex-col gap-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="rounded-2xl border border-border/60 bg-background/70 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  {/* Notice info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{notice.title}</p>
                      <Badge variant={CATEGORY_VARIANT[notice.category]}>
                        {notice.category}
                      </Badge>
                      <Badge variant="secondary">{notice.audience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                    <p className="text-xs text-muted-foreground">
                      By {notice.author} · {formatDate(notice.date)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => openEdit(notice)}
                    >
                      <Pencil className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      disabled={deletingId === notice.id}
                      onClick={() => handleDelete(notice)}
                    >
                      <Trash2 className="size-3 mr-1" />
                      {deletingId === notice.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="n-title">Title</Label>
              <Input id="n-title" placeholder="Exam schedule updated" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="n-content">Content</Label>
              <Textarea
                id="n-content"
                placeholder="Describe the update in a concise but informative way."
                rows={4}
                {...register('content')}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="n-category">Category</Label>
                <select
                  id="n-category"
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                  {...register('category')}
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="n-audience">Audience</Label>
                <select
                  id="n-audience"
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                  {...register('audience')}
                >
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="teachers">Teachers</option>
                  <option value="parents">Parents</option>
                </select>
              </div>
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
