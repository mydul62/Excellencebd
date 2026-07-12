'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/shared/logo'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/courses', label: 'Courses' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/notice', label: 'Notice' },
  { href: '/contact', label: 'Contact' },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const loginRedirect = encodeURIComponent(pathname)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button render={<Link href={`/dashboard/${user.role}`} />} variant="ghost" size="sm">
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => { logout(); router.push('/') }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button render={<Link href={`/login?redirect=${loginRedirect}`} />} variant="ghost" size="sm">
                Login
              </Button>
              <Button render={<Link href="/register" />} size="sm">
                Register
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            }
          />
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button
                      render={<Link href={`/dashboard/${user.role}`} onClick={() => setOpen(false)} />}
                      variant="ghost"
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout()
                        setOpen(false)
                        router.push('/')
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      render={<Link href={`/login?redirect=${loginRedirect}`} onClick={() => setOpen(false)} />}
                      variant="outline"
                    >
                      Login
                    </Button>
                    <Button render={<Link href="/register" onClick={() => setOpen(false)} />}>
                      Register
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
