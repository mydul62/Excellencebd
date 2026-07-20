'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Camera } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  getPhotoGallery,
  type ServerPhotoGalleryItem,
} from '@/serverdata/photo-gallery'

export function PhotoGallerySection() {
  const [photos, setPhotos] = useState<ServerPhotoGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] =
    useState<ServerPhotoGalleryItem | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const result = await getPhotoGallery({
          page: 1,
          limit: 6,
        })

        setPhotos(result.data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <section className="mx-auto w-[95%] container px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-3 h-9 w-52 animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="h-12 w-32 animate-pulse rounded-full bg-slate-200" />
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="h-[520px] animate-pulse rounded-3xl bg-slate-200 lg:col-span-7" />

          <div className="grid gap-5 lg:col-span-5">
            <div className="h-[248px] animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-[248px] animate-pulse rounded-3xl bg-slate-200" />
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:col-span-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!photos.length) {
    return (
      <section className="mx-auto w-[95%] max-w-7xl px-4 py-20">
        <div className="rounded-3xl border border-dashed p-16 text-center">
          No gallery photos available.
        </div>
      </section>
    )
  }

  const hero = photos[0]
  const side = photos.slice(1, 3)
  const bottom = photos.slice(3)

  return (
    <>
      <section className="mx-auto w-[95%] container px-4 py-20 sm:px-6 lg:px-8">

        {/* Header */}

        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF2F4] px-4 py-2 text-sm font-medium text-[#146373]">

              <Camera className="h-4 w-4" />

              Gallery

            </div>

            <h2 className="text-4xl font-bold text-[#0F5D73]">
              Moments We Cherish
            </h2>

            <p className="mt-3 max-w-xl text-slate-600">
              Every picture tells a story. Explore memorable moments from
              classrooms, competitions, cultural events and campus life.
            </p>

          </div>

          <Button
            render={<Link href="/photo-gallery" />}
            className="rounded-full bg-[#146373] hover:bg-[#0F5D73]"
          >
            View All

            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

        </div>

        {/* Hero Layout */}

        <div className="grid gap-5 lg:grid-cols-12">

          {/* Featured */}

          <button
            onClick={() => setSelected(hero)}
            className="group relative h-[520px] overflow-hidden rounded-[32px] lg:col-span-7"
          >
            <Image
              src={hero.imageUrl}
              alt={hero.title ?? ''}
              fill
              className="object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 text-white">

              <h3 className="text-3xl font-bold">
                {hero.title || 'Featured Event'}
              </h3>

              <p className="mt-3 max-w-lg text-white/80">
                {hero.description ||
                  'Celebrating unforgettable memories with our students.'}
              </p>

            </div>

          </button>

          {/* Right Column */}

          <div className="grid gap-5 lg:col-span-5">

            {side.map((photo) => (

              <button
                key={photo.id}
                onClick={() => setSelected(photo)}
                className="group relative h-[248px] overflow-hidden rounded-[32px]"
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title ?? ''}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 text-white">

                  <h4 className="text-xl font-semibold">
                    {photo.title || 'Campus Life'}
                  </h4>

                </div>

              </button>

            ))}

          </div>

          {/* Bottom Grid */}
                    <div className="grid gap-5 md:grid-cols-3 lg:col-span-12">
            {bottom.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelected(photo)}
                className="group relative h-[220px] overflow-hidden rounded-[32px]"
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title ?? ''}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="absolute bottom-0 left-0 p-5 text-left text-white">
                  <h4 className="text-lg font-semibold">
                    {photo.title || 'School Activity'}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-sm text-white/80">
                    {photo.description ||
                      'A memorable moment from our learning community.'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-6xl overflow-hidden rounded-[32px] border-0 p-0 shadow-2xl">
          {selected && (
            <>
              <DialogHeader className="border-b bg-white px-8 py-6">
                <DialogTitle className="text-2xl font-bold text-[#0F5D73]">
                  {selected.title || 'Gallery Image'}
                </DialogTitle>
              </DialogHeader>

              <div className="bg-slate-50 p-8">
                <div className="relative aspect-video overflow-hidden rounded-3xl">
                  <Image
                    src={selected.imageUrl}
                    alt={selected.title ?? ''}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="mt-6">
                  <p className="text-base leading-7 text-slate-600">
                    {selected.description ||
                      'A wonderful memory captured from our students and campus events.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}