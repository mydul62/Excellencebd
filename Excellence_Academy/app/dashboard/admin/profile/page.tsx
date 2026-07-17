'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, KeyRound, Loader2, Save, X } from 'lucide-react'

import { SectionCard } from '@/components/dashboard/section-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/format'
import {
  changeAdminPassword,
  getAdminProfile,
  updateAdminProfile,
  type AdminProfile,
} from '@/serverdata/admin'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: z.string().trim().optional(),
})

const passwordSchema = z
  .object({
    oldPassword: z.string().min(4, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<AdminProfile | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Selected avatar file — kept outside react-hook-form (File is not serialisable)
  const avatarFileRef = useRef<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      try {
        const data = await getAdminProfile()
        if (mounted) {
          setAdmin(data)
          profileForm.reset({ name: data.name ?? '', phone: data.phone ?? '' })
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadProfile()
    return () => { mounted = false }
  }, [profileForm])

  async function onProfileSave(values: ProfileFormValues) {
    setUploading(true)
    try {
      const updated = await updateAdminProfile({
        name: values.name,
        phone: values.phone || undefined,
        // Pass File if one was selected, otherwise leave undefined (keep existing)
        ...(avatarFileRef.current ? { avatar: avatarFileRef.current } : {}),
      })
      setAdmin(updated)
      avatarFileRef.current = null
      setAvatarPreview(null)
      toast.success('Profile updated successfully')
      setEditingProfile(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setUploading(false)
    }
  }

  async function onPasswordSave(values: PasswordFormValues) {
    try {
      await changeAdminPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  function handleCancelEdit() {
    setEditingProfile(false)
    avatarFileRef.current = null
    setAvatarPreview(null)
    profileForm.reset({ name: admin?.name ?? '', phone: admin?.phone ?? '' })
  }

  if (loading) {
    return (
      <SectionCard title="Profile">
        <div className="flex gap-6">
          <div className="size-20 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </SectionCard>
    )
  }

  if (error) {
    return (
      <SectionCard title="Profile">
        <p className="text-sm text-destructive">{error}</p>
      </SectionCard>
    )
  }

  if (!admin) {
    return (
      <SectionCard title="Profile">
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Profile Information ── */}
      <SectionCard
        title="Profile Information"
        description="Manage your admin profile details and picture."
        action={
          !editingProfile ? (
            <Button variant="outline" onClick={() => setEditingProfile(true)}>
              Edit Profile
            </Button>
          ) : null
        }
      >
        {!editingProfile ? (
          /* View mode */
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar size="lg">
              {admin.avatar ? (
                <AvatarImage src={admin.avatar} alt={admin.name} />
              ) : null}
              <AvatarFallback>{admin.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground">{admin.name}</h2>
              <p className="text-sm text-muted-foreground">Email: {admin.email}</p>
              <p className="text-sm text-muted-foreground">Phone: {admin.phone ?? '—'}</p>
              <p className="text-sm text-muted-foreground">Role: {admin.role}</p>
              <p className="text-sm text-muted-foreground">Account Status: {admin.status}</p>
              <p className="text-sm text-muted-foreground">Joined: {formatDate(admin.createdAt)}</p>
            </div>
          </div>
        ) : (
          /* Edit mode */
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="grid max-w-lg gap-6">
            {/* Avatar upload */}
            <AvatarUpload
              existingUrl={avatarPreview ?? admin.avatar}
              uploading={uploading}
              onFileSelect={(file) => {
                avatarFileRef.current = file
                if (avatarPreview) URL.revokeObjectURL(avatarPreview)
                setAvatarPreview(URL.createObjectURL(file))
              }}
              onClear={() => {
                avatarFileRef.current = null
                if (avatarPreview) URL.revokeObjectURL(avatarPreview)
                setAvatarPreview(null)
              }}
              disabled={uploading}
            />

            <div className="grid gap-2">
              <Label htmlFor="admin-name">Full Name</Label>
              <Input id="admin-name" {...profileForm.register('name')} disabled={uploading} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-phone">Phone Number</Label>
              <Input id="admin-phone" placeholder="01XXXXXXXXX" {...profileForm.register('phone')} disabled={uploading} />
              {profileForm.formState.errors.phone && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={uploading}>
                <X className="mr-2 size-4" />
                Cancel
              </Button>
            </div>
          </form>
        )}
      </SectionCard>

      {/* ── Change Password ── */}
      <SectionCard
        title="Change Password"
        description="Securely update your account password. Current password is required."
      >
        <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="grid max-w-lg gap-4">
          <div className="grid gap-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                {...passwordForm.register('oldPassword')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                onClick={() => setShowCurrentPassword((s) => !s)}
              >
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.oldPassword && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.oldPassword.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                {...passwordForm.register('newPassword')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                onClick={() => setShowNewPassword((s) => !s)}
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.newPassword && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...passwordForm.register('confirmPassword')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                onClick={() => setShowConfirmPassword((s) => !s)}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={passwordForm.formState.isSubmitting} className="w-fit">
            <KeyRound className="mr-2 size-4" />
            {passwordForm.formState.isSubmitting ? 'Changing…' : 'Change Password'}
          </Button>
        </form>
      </SectionCard>
    </div>
  )
}
