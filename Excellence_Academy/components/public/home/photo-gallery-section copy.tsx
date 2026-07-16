'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Camera } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getPhotoGallery, type ServerPhotoGalleryItem } from '@/serverdata/photo-gallery'

export function PhotoGallerySection() {
  const [photos, setPhotos] = useState<ServerPhotoGalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await getPhotoGallery({ page: 1, limit: 6 })
        setPhotos(result.data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <section className="mx-auto flex w-[95%] max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#EAF2F4] px-3 py-1 text-sm font-medium text-[#146373]">
            <Camera className="size-4" />
            Memories with our students
          </div>
          <h2 className="text-2xl font-semibold text-[#0F5D73] sm:text-3xl">Photo Gallery</h2>
        </div>
        <Button render={<Link href="/photo-gallery" />} variant="outline" className="rounded-full border-[#146373]/20 text-[#146373] hover:bg-[#EAF2F4]">
          View All <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-3xl bg-[#F3F6F8]" />
          ))}
        </div>
      ) : null}

      {!loading && photos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#146373]/20 bg-[#F7FAFC] p-8 text-center text-[#146373]">
          No photos yet. Check back soon.
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="overflow-hidden rounded-3xl border border-[#146373]/10 bg-white shadow-sm">
            <div className="relative aspect-4/3">
              <Image src={photo.imageUrl} alt={photo.title ?? 'Photo gallery'} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[#0F5D73]">{photo.title || 'Memorable Moment'}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{photo.description || 'A cherished memory from our student community.'}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
