'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { KeyRound, Loader2, Save, X } from 'lucide-react'

import { getTeacherDashboard, type ServerTeacher } from '@/services'
import { updateUser } from '@/serverdata/users'
import { changePasswordApi } from '@/serverdata/auth'
import { SectionCard } from '@/components/dashboard/section-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'

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

export default function TeacherProfilePage() {
  const { user } = useAuth()
  const [teacher, setTeacher] = useState<ServerTeacher | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [uploading, setUploading] = useState(false)

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
    if (!user?.id) return
    getTeacherDashboard(user.id)
      .then((d) => {
        setTeacher(d.teacher)
        if (d.teacher) {
          profileForm.reset({
            name: d.teacher.user?.name ?? '',
            phone: d.teacher.user?.phone ?? '',
          })
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onProfileSave(values: ProfileFormValues) {
    if (!user?.id) return
    setUploading(true)
    try {
      await updateUser(user.id, {
        name: values.name,
        phone: values.phone || undefined,
        ...(avatarFileRef.current ? { avatar: avatarFileRef.current } : {}),
      })
      // Optimistically update local state
      setTeacher((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                name: values.name,
                phone: values.phone ?? null,
                // If a new file was uploaded, the preview URL reflects the new avatar
                // The real Cloudinary URL will be fetched on next page load
                avatar: avatarPreview ?? prev.user?.avatar ?? null,
              },
            }
          : prev,
      )
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
      await changePasswordApi({ oldPassword: values.oldPassword, newPassword: values.newPassword })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  function handleCancelEdit() {
    setEditingProfile(false)
    avatarFileRef.current = null
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarPreview(null)
    profileForm.reset({ name: teacher?.user?.name ?? '', phone: teacher?.user?.phone ?? '' })
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

  if (!teacher) {
    return (
      <SectionCard title="Profile">
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Profile Info ── */}
      <SectionCard
        title="Profile Information"
        description="Update your display name, phone, and avatar."
        action={
          !editingProfile ? (
            <Button variant="outline" onClick={() => setEditingProfile(true)}>
              Edit Profile
            </Button>
          ) : null
        }
      >
        {!editingProfile ? (
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar size="lg">
              {teacher.user?.avatar ? (
                <AvatarImage src={teacher.user.avatar} alt={teacher.user?.name ?? ''} />
              ) : null}
              <AvatarFallback>{(teacher.user?.name ?? 'T').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground">{teacher.user?.name}</h2>
              <p className="text-sm text-muted-foreground">{teacher.subject} · {teacher.qualification ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{teacher.bio ?? '—'}</p>
              <p className="text-sm text-muted-foreground">Experience: {teacher.experienceYears} years</p>
              <p className="text-sm text-muted-foreground">Email: {teacher.user?.email}</p>
              <p className="text-sm text-muted-foreground">Phone: {teacher.user?.phone ?? '—'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="grid max-w-lg gap-6">
            <AvatarUpload
              existingUrl={avatarPreview ?? teacher.user?.avatar}
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
              <Label htmlFor="teacher-name">Full Name</Label>
              <Input id="teacher-name" {...profileForm.register('name')} disabled={uploading} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="teacher-phone">Phone</Label>
              <Input id="teacher-phone" placeholder="01XXXXXXXXX" {...profileForm.register('phone')} disabled={uploading} />
              {profileForm.formState.errors.phone && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" />Uploading…</>
                ) : (
                  <><Save className="mr-2 size-4" />Save Changes</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={uploading}>
                <X className="mr-2 size-4" />Cancel
              </Button>
            </div>
          </form>
        )}
      </SectionCard>

      {/* ── Change Password ── */}
      <SectionCard
        title="Change Password"
        description="Update your login password. You must enter your current password to confirm."
      >
        <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="grid max-w-lg gap-4">
          <div className="grid gap-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input id="oldPassword" type="password" {...passwordForm.register('oldPassword')} />
            {passwordForm.formState.errors.oldPassword && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.oldPassword.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
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
