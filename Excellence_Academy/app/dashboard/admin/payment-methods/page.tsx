'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  ArrowLeft, CreditCard, Pencil, Plus, Power, PowerOff, Search, Trash2,
} from 'lucide-react'

import {
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodActive,
  deletePaymentMethod,
  type ServerPaymentMethod,
} from '@/serverdata/paymentMethods'
import { ImageUpload } from '@/components/ui/image-upload'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

// ─── Form schema ──────────────────────────────────────────────────────────────

const pmSchema = z.object({
  name:          z.string().trim().min(1, 'Name is required'),
  accountNumber: z.string().trim().min(1, 'Account number is required'),
  accountName:   z.string().trim().min(1, 'Account name is required'),
  accountType:   z.string().trim().min(1, 'Account type is required'),
  instructions:  z.string().trim().optional(),
  isActive:      z.boolean().optional(),
})
type PmFormValues = z.infer<typeof pmSchema>

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPaymentMethodsPage() {
  const [methods,       setMethods]       = useState<ServerPaymentMethod[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [search,        setSearch]        = useState('')
  const [dialogOpen,    setDialogOpen]    = useState(false)
  const [editTarget,    setEditTarget]    = useState<ServerPaymentMethod | null>(null)
  const [togglingId,    setTogglingId]    = useState<string | null>(null)
  const [deletingId,    setDeletingId]    = useState<string | null>(null)
  const [saving,        setSaving]        = useState(false)

  // logo file for create / edit
  const logoFileRef = useRef<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const form = useForm<PmFormValues>({ resolver: zodResolver(pmSchema) })

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchMethods = () => {
    setLoading(true)
    getAllPaymentMethods({ limit: 100 })
      .then(({ data }) => setMethods(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchMethods() }, [])

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = methods.filter((m) => {
    const q = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.accountName.toLowerCase().includes(q) ||
      m.accountType.toLowerCase().includes(q) ||
      m.accountNumber.toLowerCase().includes(q)
    )
  })

  // ── Open create dialog ────────────────────────────────────────────────────
  function openCreate() {
    setEditTarget(null)
    logoFileRef.current = null
    setLogoPreview(null)
    form.reset({ name: '', accountNumber: '', accountName: '', accountType: '', instructions: '', isActive: true })
    setDialogOpen(true)
  }

  // ── Open edit dialog ──────────────────────────────────────────────────────
  function openEdit(pm: ServerPaymentMethod) {
    setEditTarget(pm)
    logoFileRef.current = null
    setLogoPreview(null)
    form.reset({
      name:          pm.name,
      accountNumber: pm.accountNumber,
      accountName:   pm.accountName,
      accountType:   pm.accountType,
      instructions:  pm.instructions ?? '',
      isActive:      pm.isActive,
    })
    setDialogOpen(true)
  }

  // ── Save (create or update) ───────────────────────────────────────────────
  async function onSubmit(values: PmFormValues) {
    setSaving(true)
    try {
      if (editTarget) {
        await updatePaymentMethod(editTarget.id, {
          ...values,
          logo: logoFileRef.current ?? undefined,
        })
        toast.success('Payment method updated')
      } else {
        await createPaymentMethod({
          ...values,
          logo: logoFileRef.current ?? undefined,
        })
        toast.success('Payment method created')
      }
      setDialogOpen(false)
      fetchMethods()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle active ─────────────────────────────────────────────────────────
  async function handleToggle(pm: ServerPaymentMethod) {
    setTogglingId(pm.id)
    try {
      await togglePaymentMethodActive(pm.id, !pm.isActive)
      toast.success(pm.isActive ? 'Payment method disabled' : 'Payment method enabled')
      fetchMethods()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle')
    } finally {
      setTogglingId(null)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(pm: ServerPaymentMethod) {
    const confirmed = confirm(
      `Delete "${pm.name}"? This will fail if enrollments are linked to it.`,
    )
    if (!confirmed) return
    setDeletingId(pm.id)
    try {
      await deletePaymentMethod(pm.id)
      toast.success('Payment method deleted')
      setMethods((prev) => prev.filter((m) => m.id !== pm.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <CreditCard className="h-4 w-4" /> Payment Methods
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Payment Methods</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Manage the payment options available to students when enrolling.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button render={<Link href="/dashboard/admin" />} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Method
            </Button>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search payment methods…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* ── Table ── */}
      <SectionCard title="All Payment Methods" description="Click a row action to edit, enable/disable, or delete">

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="py-6 text-center text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CreditCard className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? 'No results match your search.' : 'No payment methods yet. Add one to get started.'}
            </p>
            {!search && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1 size-4" /> Add First Method
              </Button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Account Number</th>
                  <th className="px-4 py-3 font-medium">Account Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((pm) => (
                  <tr key={pm.id} className="bg-background transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                          {pm.logoUrl ? (
                            <Image
                              src={pm.logoUrl}
                              alt={pm.name}
                              width={36}
                              height={36}
                              className="size-full object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">
                              {pm.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-foreground">{pm.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">{pm.accountNumber}</td>
                    <td className="px-4 py-3 text-foreground">{pm.accountName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">{pm.accountType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={pm.isActive ? 'default' : 'secondary'} className="text-xs">
                        {pm.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => openEdit(pm)}
                        >
                          <Pencil className="mr-1 size-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          disabled={togglingId === pm.id}
                          onClick={() => handleToggle(pm)}
                          title={pm.isActive ? 'Disable' : 'Enable'}
                        >
                          {pm.isActive ? (
                            <PowerOff className="mr-1 size-3 text-amber-500" />
                          ) : (
                            <Power className="mr-1 size-3 text-emerald-500" />
                          )}
                          {togglingId === pm.id ? '…' : pm.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          disabled={deletingId === pm.id}
                          onClick={() => handleDelete(pm)}
                        >
                          <Trash2 className="mr-1 size-3" />
                          {deletingId === pm.id ? 'Removing…' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setDialogOpen(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-2">

            {/* Logo upload */}
            <div className="grid gap-2">
              <Label>Logo</Label>
              <ImageUpload
                shape="rect"
                existingUrl={logoPreview ?? editTarget?.logoUrl ?? null}
                disabled={saving}
                onFileSelect={(file) => {
                  logoFileRef.current = file
                  if (logoPreview) URL.revokeObjectURL(logoPreview)
                  setLogoPreview(URL.createObjectURL(file))
                }}
                onClear={() => {
                  logoFileRef.current = null
                  if (logoPreview) URL.revokeObjectURL(logoPreview)
                  setLogoPreview(null)
                }}
              />
              <p className="text-xs text-muted-foreground">JPG · PNG · WebP — max 5 MB</p>
            </div>

            {/* Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="pm-name">Name <span className="text-destructive">*</span></Label>
                <Input id="pm-name" {...form.register('name')} disabled={saving} placeholder="e.g. bKash" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pm-type">Account Type <span className="text-destructive">*</span></Label>
                <Input id="pm-type" {...form.register('accountType')} disabled={saving} placeholder="e.g. Mobile Banking" />
                {form.formState.errors.accountType && (
                  <p className="text-xs text-destructive">{form.formState.errors.accountType.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="pm-number">Account Number <span className="text-destructive">*</span></Label>
                <Input id="pm-number" {...form.register('accountNumber')} disabled={saving} placeholder="01XXXXXXXXX" />
                {form.formState.errors.accountNumber && (
                  <p className="text-xs text-destructive">{form.formState.errors.accountNumber.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pm-acname">Account Name <span className="text-destructive">*</span></Label>
                <Input id="pm-acname" {...form.register('accountName')} disabled={saving} placeholder="e.g. Bright Future Academy" />
                {form.formState.errors.accountName && (
                  <p className="text-xs text-destructive">{form.formState.errors.accountName.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pm-instructions">Instructions <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="pm-instructions"
                rows={2}
                {...form.register('instructions')}
                disabled={saving}
                placeholder="e.g. Send to Personal number and note your name in the reference."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pm-active"
                className="size-4 rounded border-border accent-primary"
                {...form.register('isActive')}
                defaultChecked
                disabled={saving}
              />
              <Label htmlFor="pm-active" className="cursor-pointer text-sm font-normal">
                Active (visible to students)
              </Label>
            </div>

            <DialogFooter showCloseButton>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Method'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
