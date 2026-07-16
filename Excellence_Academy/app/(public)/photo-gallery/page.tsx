"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { getPhotoGallery, type ServerPhotoGalleryItem } from "@/serverdata/photo-gallery"

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState<ServerPhotoGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ServerPhotoGalleryItem | null>(null)

  async function fetchPhotos() {
    try {
      setLoading(true)

      let page = 1
      const limit = 50
      let allPhotos: ServerPhotoGalleryItem[] = []

      while (true) {
        const result = await getPhotoGallery({
          page,
          limit,
        })

        allPhotos = [...allPhotos, ...result.data]

        if (result.data.length < limit) break
        page++
      }

      setPhotos(allPhotos)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load gallery"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#146373] via-[#0F5D73] to-[#0A4252]">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[340px] w-[95%] max-w-7xl flex-col justify-center py-20">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-white backdrop-blur">
            <Camera className="h-5 w-5" />
            Our Beautiful Memories
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight text-white lg:text-6xl">
            Explore Our{" "}
            <span className="block text-cyan-200">
              Photo Gallery
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            Every picture tells a story. Discover memorable moments from
            classrooms, cultural programs, sports, celebrations,
            competitions and campus life.
          </p>
        </div>
      </section>

      <main className="mx-auto w-[95%] max-w-7xl py-16">
        {loading && (
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#146373]">
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-lg font-medium">
                Loading Gallery...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 py-20 text-center">
            <Camera className="mx-auto mb-5 h-16 w-16 text-slate-400" />
            <h2 className="text-2xl font-semibold">
              No Photos Found
            </h2>
            <p className="mt-2 text-slate-500">
              Photos will appear here once they are uploaded.
            </p>
          </div>
        )}

        {!loading && !error && photos.length > 0 && (
          <>
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-[#0F5D73]">
                Moments We Captured
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-slate-600">
                Browse our collection of memorable moments from student
                activities, campus life, seminars, cultural programs,
                sports and celebrations.
              </p>
            </div>

            {/* Masonry Gallery Starts Here */}
            <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-4">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelected(photo)}
                  className="group relative mb-6 w-full cursor-pointer overflow-hidden rounded-[28px] bg-white break-inside-avoid shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div
                    className={`relative w-full overflow-hidden ${
                      index % 7 === 0
                        ? "aspect-[4/5]"
                        : index % 5 === 0
                        ? "aspect-square"
                        : index % 3 === 0
                        ? "aspect-[3/4]"
                        : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={photo.imageUrl}
                      alt={photo.title ?? "Gallery"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100" />

                    {/* Top Badge */}
                    <div className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-md transition duration-500 group-hover:opacity-100">
                      School Gallery
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 translate-y-6 p-6 text-left text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <h3 className="text-xl font-bold">
                        {photo.title || "Memorable Moment"}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-white/80">
                        {photo.description ||
                          "Capturing unforgettable memories with our students."}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Gallery Statistics */}
            <div className="mt-20 rounded-[32px] bg-gradient-to-r from-[#146373] to-[#0F5D73] p-10 text-white">
              <div className="grid gap-10 text-center md:grid-cols-3">
                <div>
                  <h3 className="text-5xl font-bold">{photos.length}+</h3>
                  <p className="mt-2 text-white/80">Photos</p>
                </div>
                <div>
                  <h3 className="text-5xl font-bold">100+</h3>
                  <p className="mt-2 text-white/80">Student Activities</p>
                </div>
                <div>
                  <h3 className="text-5xl font-bold">∞</h3>
                  <p className="mt-2 text-white/80">Beautiful Memories</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Lightbox Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-7xl overflow-hidden rounded-[32px] border-0 p-0 shadow-2xl">
          <DialogHeader className="border-b bg-white px-8 py-6">
            <DialogTitle className="text-2xl font-bold text-[#146373]">
              {selected?.title || "Photo"}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="bg-black p-6">
              <div className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-3xl bg-black">
                <Image
                  src={selected.imageUrl}
                  alt={selected.title ?? "Gallery Image"}
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="mt-8 rounded-3xl bg-white p-8">
                <h2 className="text-3xl font-bold text-[#146373]">
                  {selected.title || "School Gallery"}
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  {selected.description ||
                    "Every photograph preserves a beautiful memory. These moments reflect our students' learning journey, achievements, cultural programs, sports activities and joyful campus life."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}