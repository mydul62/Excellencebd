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
  { href: '/', label: 'হোম' },
  { href: '/about', label: 'আমাদের সম্পর্কে' },
  { href: '/courses', label: 'কোর্সসমূহ' },
  { href: '/teachers', label: 'শিক্ষকগণ' },
  { href: '/notice', label: 'নোটিশ' },
  { href: '/photo-gallery', label: 'ফটো গ্যালারি' },
  { href: '/contact', label: 'যোগাযোগ' },
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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-[#FFFFFF] shadow-[0_8px_30px_rgba(15,93,115,0.08)] backdrop-blur-md">
      <div className="mx-auto container flex h-16 w-[95%] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300',
                isActive(link.href)
                  ? 'bg-[#EAF2F4] text-[#0F5D73]'
                  : 'text-[#0F5D73] hover:bg-[#EAF2F4] hover:text-[#146373]',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button render={<Link href={`/dashboard/${user.role}`} />} variant="ghost" size="sm" className="h-9 rounded-full border border-[#146373]/20 bg-[#FFFFFF] px-4 text-[#146373] hover:bg-[#EAF2F4] hover:text-[#0F5D73]">
                ড্যাশবোর্ড
              </Button>
              <Button variant="outline" size="sm" className="h-9 rounded-full border-[#146373] bg-[#146373] px-4 text-white hover:bg-[#0F5D73]" onClick={async () => { await logout(); router.push('/login') }}>
                লগআউট
              </Button>
            </>
          ) : (
            <>
              <Button render={<Link href={`/login?redirect=${loginRedirect}`} />} variant="ghost" size="sm" className="h-9 rounded-full border border-[#146373]/20 bg-[#FFFFFF] px-4 text-[#146373] hover:bg-[#EAF2F4] hover:text-[#0F5D73]">
                লগইন
              </Button>
              <Button render={<Link href="/register" />} size="sm" className="h-9 rounded-full bg-[#146373] px-4 text-white hover:bg-[#0F5D73]">
                রেজিস্টার
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
                      ড্যাশবোর্ড
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await logout()
                        setOpen(false)
                        router.push('/login')
                      }}
                    >
                      লগআউট
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      render={<Link href={`/login?redirect=${loginRedirect}`} onClick={() => setOpen(false)} />}
                      variant="outline"
                    >
                      লগইন
                    </Button>
                    <Button render={<Link href="/register" onClick={() => setOpen(false)} />}>
                      রেজিস্টার
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
