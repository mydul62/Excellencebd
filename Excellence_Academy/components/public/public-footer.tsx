import Link from 'next/link'
import { Badge, Globe, Mail, MapPin, Phone, Send, Share } from 'lucide-react'
import { Logo } from '@/components/shared/logo'

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/courses', label: 'Courses' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/notice', label: 'Notices' },
  { href: '/contact', label: 'Contact' },
]

const socials = [
  { icon: Globe, label: 'Website' },
  { icon: Share, label: 'Social' },
  { icon: Send, label: 'Community' },
  { icon: Badge, label: 'Success' },
]

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-[#010F3F]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-[#8FA2B8]">
              Empowering students with quality education, experienced teachers, and a nurturing
              environment for a brighter future.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-[#8FA2B8] transition-colors duration-300 hover:bg-[#F9801D] hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-white">দ্রুত লিংক</h4>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#8FA2B8] transition-colors duration-300 hover:text-[#F9801D]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-white">প্রোগ্রামসমূহ</h4>
            <ul className="flex flex-col gap-2 text-sm text-[#8FA2B8]">
              <li>HSC & SSC Academic</li>
              <li>Web Development</li>
              <li>Spoken English & IELTS</li>
              <li>Science & Mathematics</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-white">যোগাযোগ করুন</h4>
            <ul className="flex flex-col gap-3 text-sm text-[#8FA2B8]">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#F9801D]" />
                বাড়ি নং ৩১৫, রোড নং ১৩, সাভার DOHS, সাভার
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-[#F9801D]" />
               +880 1306031982
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-[#F9801D]" />
              toukirahmed.th@gmail.com
              </li>
            </ul>
          </div>
        </div>

    <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-[#8FA2B8] sm:flex-row">
  <p>
    &copy; {new Date().getFullYear()} Excellence Academy. সর্বস্বত্ব সংরক্ষিত।
  </p>

  <p>
    শিক্ষায় উৎকর্ষের জন্য নির্মিত।
  </p>

  <p>
    Developed by{" "}
    <Link
      href="https://www.linkedin.com/in/mahim62?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      target="_blank"
      rel="noopener noreferrer"
      className="
        font-semibold
        text-white
        transition
        hover:text-[#F9801D]
      "
    >
      Md Mydul Islam
    </Link>
  </p>
</div>
      </div>
    </footer>
  )
}
