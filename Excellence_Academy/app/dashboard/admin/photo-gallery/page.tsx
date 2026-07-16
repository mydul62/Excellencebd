'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2, PencilLine, PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createPhotoGallery,
  deletePhotoGallery,
  getPhotoGallery,
  updatePhotoGallery,
  type ServerPhotoGalleryItem,
} from '@/serverdata/photo-gallery'

export default function AdminPhotoGalleryPage() {
  const [items, setItems] = useState<ServerPhotoGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ServerPhotoGalleryItem | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('memories')

  // For new uploads: hold multiple files (one ImageUpload per slot)
  // For edit: hold a single replacement file
  const [newFiles, setNewFiles] = useState<File[]>([File.prototype]) // placeholder array
  const [editFile, setEditFile] = useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)

  // Multi-slot state for create mode — up to 10 images
  const [slots, setSlots] = useState<Array<File | null>>([null])

  async function load() {
    try {
      setLoading(true)
      const result = await getPhotoGallery({ page: 1, limit: 50 })
      setItems(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setTitle('')
    setDescription('')
    setCategory('memories')
    setSlots([null])
    setEditFile(null)
    setError(null)
    setOpen(true)
  }

  function openEdit(item: ServerPhotoGalleryItem) {
    setEditing(item)
    setTitle(item.title ?? '')
    setDescription(item.description ?? '')
    setCategory(item.category ?? 'memories')
    setSlots([null])
    setEditFile(null)
    setError(null)
    setOpen(true)
  }

  function closeDialog() {
    setOpen(false)
    setEditing(null)
    setTitle('')
    setDescription('')
    setCategory('memories')
    setSlots([null])
    setEditFile(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (editing) {
        // ── Edit mode ──────────────────────────────────────────────
        const fd = new FormData()
        if (title) fd.append('title', title)
        if (description) fd.append('description', description)
        if (category) fd.append('category', category)
        if (editFile) fd.append('image', editFile)   // single file, field: 'image'
        await updatePhotoGallery(editing.id, fd)
        toast.success('Photo updated successfully')
      } else {
        // ── Create mode ────────────────────────────────────────────
        const filesToUpload = slots.filter((f): f is File => f !== null)
        if (filesToUpload.length === 0) {
          setError('Please select at least one image to upload.')
          setSubmitting(false)
          return
        }
        const fd = new FormData()
        if (title) fd.append('title', title)
        if (description) fd.append('description', description)
        if (category) fd.append('category', category)
        filesToUpload.forEach((file) => fd.append('images', file)) // field: 'images'
        await createPhotoGallery(fd)
        toast.success(`${filesToUpload.length} photo${filesToUpload.length > 1 ? 's' : ''} uploaded successfully`)
      }

      closeDialog()
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this photo permanently?')) return
    try {
      await deletePhotoGallery(id)
      toast.success('Photo deleted')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete photo')
    }
  }

  // Add a new image slot (max 10)
  function addSlot() {
    if (slots.length < 10) setSlots((prev) => [...prev, null])
  }

  const emptyState = useMemo(() => items.length === 0, [items.length])

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#EAF2F4] px-3 py-1 text-sm font-medium text-[#146373]">
            <Camera className="size-4" />
            Admin Photo Gallery
          </div>
          <h2 className="text-2xl font-semibold text-[#0F5D73]">Manage memories with students</h2>
          <p className="mt-1 text-sm text-muted-foreground">Upload, edit, and remove photo memories securely.</p>
        </div>
        <Button onClick={openCreate}>
          <PlusCircle className="mr-2 size-4" /> Add Photos
        </Button>
      </div>

      {error && !open ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : null}

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-3xl border border-dashed border-[#146373]/20 bg-[#F7FAFC]">
          <div className="flex items-center gap-3 text-[#146373]">
            <Loader2 className="size-5 animate-spin" />
            Loading gallery…
          </div>
        </div>
      ) : null}

      {/* ── Empty ── */}
      {!loading && emptyState ? (
        <div className="rounded-3xl border border-dashed border-[#146373]/20 bg-[#F7FAFC] p-10 text-center text-[#146373]">
          No gallery photos yet. Add your first memory.
        </div>
      ) : null}

      {/* ── Grid ── */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm">
            <div className="relative aspect-4/3">
              <Image src={item.imageUrl} alt={item.title ?? 'Gallery photo'} fill className="object-cover" />
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h3 className="font-semibold text-[#0F5D73]">{item.title || 'Memorable Moment'}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description || 'Shared memory with students.'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                  <PencilLine className="mr-2 size-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="mr-2 size-4" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog() }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit photo details' : 'Upload new gallery photos'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Image upload area ── */}
            {editing ? (
              /* Single replacement image for edit */
              <div className="space-y-2">
                <Label>Replace Image <span className="text-muted-foreground">(optional)</span></Label>
                <ImageUpload
                  shape="rect"
                  existingUrl={editing.imageUrl}
                  disabled={submitting}
                  onFileSelect={(file) => setEditFile(file)}
                  onClear={() => setEditFile(null)}
                />
              </div>
            ) : (
              /* Multiple slots for create */
              <div className="space-y-3">
                <Label>Images <span className="text-destructive">*</span></Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {slots.map((_, idx) => (
                    <ImageUpload
                      key={idx}
                      shape="rect"
                      disabled={submitting}
                      onFileSelect={(file) => {
                        setSlots((prev) => {
                          const next = [...prev]
                          next[idx] = file
                          return next
                        })
                      }}
                      onClear={() => {
                        setSlots((prev) => {
                          const next = [...prev]
                          next[idx] = null
                          return next
                        })
                      }}
                    />
                  ))}
                </div>
                {slots.length < 10 && (
                  <Button type="button" variant="outline" size="sm" onClick={addSlot} disabled={submitting}>
                    + Add another image
                  </Button>
                )}
              </div>
            )}

            {/* ── Metadata ── */}
            <div className="grid gap-2">
              <Label htmlFor="gallery-title">Title <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="gallery-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Sports Day 2025"
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gallery-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="gallery-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of the memory…"
                rows={3}
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gallery-category">Category</Label>
              <Input
                id="gallery-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. events, academic, sports, memories"
                disabled={submitting}
              />
            </div>

            {/* ── Inline error ── */}
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            ) : null}

            {/* ── Actions ── */}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" />Uploading…</>
                ) : editing ? (
                  'Save Changes'
                ) : (
                  'Upload Photos'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
