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
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Empowering students with quality education, experienced teachers, and a nurturing
              environment for a brighter future.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-foreground">Programs</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>HSC & SSC Academic</li>
              <li>Web Development</li>
              <li>Spoken English & IELTS</li>
              <li>Science & Mathematics</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-foreground">Get in Touch</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                House 12, Road 5, Dhanmondi, Dhaka 1205
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                +880 1711 000000
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                info@brightfuture.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Bright Future Coaching Center. All rights reserved.</p>
          <p>Built for excellence in education.</p>
        </div>
      </div>
    </footer>
  )
}
