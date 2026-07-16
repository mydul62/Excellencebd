'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export interface ImageUploadProps {
  /** Existing image URL from the backend (shown when no file is selected) */
  existingUrl?: string | null
  /** Field name that will be appended to FormData */
  fieldName?: string
  /** Called when a valid file is selected. Receives the File object. */
  onFileSelect?: (file: File) => void
  /** Called when the selection is cleared */
  onClear?: () => void
  /** Shape of the preview: 'circle' for avatars, 'rect' for gallery/banners */
  shape?: 'circle' | 'rect'
  /** Additional class name for the outer wrapper */
  className?: string
  /** Whether the control is disabled (e.g. while uploading) */
  disabled?: boolean
  /** Optional label shown above the drop zone */
  label?: string
}

export function ImageUpload({
  existingUrl,
  onFileSelect,
  onClear,
  shape = 'rect',
  className,
  disabled = false,
  label,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // The URL to display: local object-URL takes priority over the existing backend URL
  const displayUrl = previewUrl ?? existingUrl ?? null

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, and WebP images are accepted.'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'Image must be smaller than 5 MB.'
    }
    return null
  }

  const handleFile = useCallback(
    (file: File) => {
      const error = validate(file)
      if (error) {
        setValidationError(error)
        return
      }
      setValidationError(null)
      // Revoke any previous object URL to avoid memory leaks
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))
      onFileSelect?.(file)
    },
    [previewUrl, onFileSelect],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be re-selected after clearing
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setValidationError(null)
    onClear?.()
  }

  const isCircle = shape === 'circle'

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}

      <div className="relative">
        {/* ── Drop zone / preview ─────────────────────────────────── */}
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload image"
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click() }}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'group relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed transition-all duration-200',
            isCircle
              ? 'size-24 rounded-full'
              : 'aspect-video w-full rounded-2xl',
            dragOver
              ? 'border-[#146373] bg-[#EAF2F4]'
              : 'border-[#146373]/30 bg-[#F7FAFC] hover:border-[#146373] hover:bg-[#EAF2F4]',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          {displayUrl ? (
            <>
              <Image
                src={displayUrl}
                alt="Preview"
                fill
                className={cn(
                  'object-cover transition-transform duration-300 group-hover:scale-105',
                  isCircle && 'rounded-full',
                )}
                unoptimized={displayUrl.startsWith('blob:')}
              />
              {/* Hover overlay */}
              <div className={cn(
                'absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100',
                isCircle && 'rounded-full',
              )}>
                <Upload className="size-5 text-white" />
                <span className="text-xs font-medium text-white">Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-[#146373]">
              <div className={cn(
                'flex items-center justify-center rounded-full bg-[#146373]/10',
                isCircle ? 'size-10' : 'size-12',
              )}>
                <ImageIcon className={isCircle ? 'size-5' : 'size-6'} />
              </div>
              {!isCircle && (
                <>
                  <p className="text-sm font-medium">Click or drag & drop</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max 5 MB</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Remove button (only shown when there's a preview) ──── */}
        {displayUrl && !disabled && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClear() }}
            aria-label="Remove image"
            className={cn(
              'absolute flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow transition hover:scale-110',
              isCircle ? '-right-1 -top-1' : '-right-2 -top-2',
            )}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* ── Hint text for rect shape ───────────────────────────────── */}
      {!isCircle && !displayUrl && (
        <p className="text-center text-xs text-muted-foreground">
          JPG · JPEG · PNG · WebP — max 5 MB
        </p>
      )}

      {/* ── Validation error ──────────────────────────────────────── */}
      {validationError && (
        <p className="flex items-center gap-1 text-sm text-destructive">
          <X className="size-3.5 shrink-0" />
          {validationError}
        </p>
      )}

      {/* ── Hidden native file input ──────────────────────────────── */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  )
}

// ─── Convenience: upload-button-only variant ──────────────────────────────────
// Used inline inside forms where you just want "Choose file" without the full
// drop zone (e.g., compact forms).
export interface AvatarUploadProps {
  existingUrl?: string | null
  onFileSelect?: (file: File) => void
  onClear?: () => void
  disabled?: boolean
  uploading?: boolean
}

export function AvatarUpload({ existingUrl, onFileSelect, onClear, disabled, uploading }: AvatarUploadProps) {
  return (
    <div className="flex items-center gap-4">
      <ImageUpload
        shape="circle"
        existingUrl={existingUrl}
        onFileSelect={onFileSelect}
        onClear={onClear}
        disabled={disabled || uploading}
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">Profile Picture</p>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 5 MB</p>
        <p className="text-xs text-muted-foreground">Click the circle or drag a photo onto it</p>
        {uploading && (
          <p className="flex items-center gap-1.5 text-xs text-[#146373]">
            <Loader2 className="size-3 animate-spin" />
            Uploading…
          </p>
        )}
      </div>
    </div>
  )
}
