import { HeroSection } from "@/components/public/home/hero-section"
import { PopularCourses } from "@/components/public/home/popular-courses"
import { WhyChooseUs } from "@/components/public/home/why-choose-us"
import { StatsBand } from "@/components/public/home/stats-band"
import { FeaturedTeachers } from "@/components/public/home/featured-teachers"
import { Testimonials } from "@/components/public/home/testimonials"
import { CtaSection } from "@/components/public/home/cta-section"
import { PhotoGallerySection } from "@/components/public/home/photo-gallery-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularCourses />
      <WhyChooseUs />
      <StatsBand />
      <FeaturedTeachers />
      <PhotoGallerySection />
      <Testimonials />
      <CtaSection />
    </>
  )
}
