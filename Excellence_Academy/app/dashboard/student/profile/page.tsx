'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { KeyRound, Loader2, Save, X } from 'lucide-react'

import { getUser, updateUser, type ServerUser } from '@/serverdata/users'
import { changePasswordApi } from '@/serverdata/auth'
import { SectionCard } from '@/components/dashboard/section-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format'

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

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [student, setStudent] = useState<ServerUser | undefined>(undefined)
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
    getUser(user.id)
      .then((data) => {
        setStudent(data)
        profileForm.reset({ name: data.name ?? '', phone: data.phone ?? '' })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onProfileSave(values: ProfileFormValues) {
    if (!user?.id) return
    setUploading(true)
    try {
      const updated = await updateUser(user.id, {
        name: values.name,
        phone: values.phone || undefined,
        ...(avatarFileRef.current ? { avatar: avatarFileRef.current } : {}),
      })
      setStudent(updated)
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
    profileForm.reset({ name: student?.name ?? '', phone: student?.phone ?? '' })
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

  if (!student) {
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
              {student.avatar ? (
                <AvatarImage src={student.avatar} alt={student.name} />
              ) : null}
              <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground">{student.name}</h2>
              <p className="text-sm text-muted-foreground">Email: {student.email}</p>
              <p className="text-sm text-muted-foreground">Phone: {student.phone ?? '—'}</p>
              <p className="text-sm text-muted-foreground">Role: {student.role}</p>
              <p className="text-sm text-muted-foreground">Joined: {formatDate(student.createdAt)}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="grid max-w-lg gap-6">
            <AvatarUpload
              existingUrl={avatarPreview ?? student.avatar}
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
              <Label htmlFor="student-name">Full Name</Label>
              <Input id="student-name" {...profileForm.register('name')} disabled={uploading} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="student-phone">Phone</Label>
              <Input id="student-phone" placeholder="01XXXXXXXXX" {...profileForm.register('phone')} disabled={uploading} />
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
