'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BellRing,
  BookOpen,
  CalendarCheck,
  Camera,
  CreditCard,
  GraduationCap,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  ShieldCheck,
  Star,
  UserCircle2,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import type { Role } from '@/types'

const navConfig: Record<Role, { label: string; href: string; icon: typeof LayoutGrid }[]> = {
  admin: [
    { label: 'ড্যাশবোর্ড', href: '/dashboard/admin', icon: LayoutGrid },
    { label: 'শিক্ষার্থীরা', href: '/dashboard/admin/students', icon: Users },
    { label: 'শিক্ষকগণ', href: '/dashboard/admin/teachers', icon: GraduationCap },
    { label: 'কোর্সসমূহ', href: '/dashboard/admin/courses', icon: BookOpen },
    { label: 'কোর্স অ্যাসাইন', href: '/dashboard/admin/course-assign', icon: BookOpen },
    { label: 'উপস্থিতি', href: '/dashboard/admin/attendance', icon: CalendarCheck },
    { label: 'এনরোলমেন্ট', href: '/dashboard/admin/enrollments', icon: BookOpen },
    { label: 'পেমেন্ট মেথড', href: '/dashboard/admin/payment-methods', icon: CreditCard },
    { label: 'নোটিশ', href: '/dashboard/admin/notices', icon: BellRing },
    { label: 'ফটো গ্যালারি', href: '/dashboard/admin/photo-gallery', icon: Camera },
    { label: 'টেস্টিমনিয়ালস', href: '/dashboard/admin/reviews', icon: Star },
    { label: 'কোর্স রিভিউ', href: '/dashboard/admin/course-reviews', icon: Star },
    { label: 'প্রোফাইল', href: '/dashboard/admin/profile', icon: UserCircle2 },
  ],
  teacher: [
    { label: 'ড্যাশবোর্ড', href: '/dashboard/teacher', icon: LayoutGrid },
    { label: 'আমার কোর্স', href: '/dashboard/teacher/courses', icon: BookOpen },
    { label: 'শিক্ষার্থীরা', href: '/dashboard/teacher/students', icon: Users },
    { label: 'উপস্থিতি', href: '/dashboard/teacher/attendance', icon: CalendarCheck },
    { label: 'নোটিশ', href: '/dashboard/teacher/notices', icon: BellRing },
    { label: 'প্রোফাইল', href: '/dashboard/teacher/profile', icon: UserCircle2 },
  ],
  student: [
    { label: 'ড্যাশবোর্ড', href: '/dashboard/student', icon: LayoutGrid },
    { label: 'আমার কোর্স', href: '/dashboard/student/courses', icon: BookOpen },
    { label: 'কোর্স ব্রাউজ', href: '/dashboard/student/browse', icon: BarChart3 },
    { label: 'উপস্থিতি', href: '/dashboard/student/attendance', icon: CalendarCheck },
    { label: 'রিভিউ', href: '/dashboard/student/reviews', icon: Star },
    { label: 'নোটিশ', href: '/dashboard/student/notices', icon: BellRing },
    { label: 'প্রোফাইল', href: '/dashboard/student/profile', icon: UserCircle2 },
  ],
}

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  const role = (pathname.split('/')[2] as Role | undefined) ?? 'student'
  const links = navConfig[role] ?? navConfig.student

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        ড্যাশবোর্ড লোড হচ্ছে...
      </div>
    )
  }

  const roleTitle =
    role === 'admin'
      ? 'অ্যাডমিন'
      : role === 'teacher'
      ? 'শিক্ষক'
      : 'শিক্ষার্থী'

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-72 max-w-[85vw] border-0 bg-[linear-gradient(180deg,#2f3fa8_0%,#1f2c85_100%)] p-0 text-white"
        >
          <div className="flex h-full flex-col px-4 py-6">
            <div className="mb-8 flex items-center gap-3 px-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheck className="size-5" />
              </div>

              <div>
                <p className="font-display text-base font-semibold leading-tight">
                  ব্রাইট ফিউচার
                </p>
                <p className="text-xs text-white/60">কোচিং সেন্টার</p>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              {links.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-white text-[#2f3fa8] shadow-sm'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
              onClick={async () => {
                await logout()
                setMobileMenuOpen(false)
                router.push('/login')
              }}
            >
              <LogOut className="size-4" />
              লগআউট
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[linear-gradient(180deg,#2f3fa8_0%,#1f2c85_100%)] px-4 py-6 text-white lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/15">
            <ShieldCheck className="size-5" />
          </div>

          <div>
            <p className="font-display text-base font-semibold leading-tight">
              ব্রাইট ফিউচার
            </p>
            <p className="text-xs text-white/60">কোচিং সেন্টার</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white text-[#2f3fa8] shadow-sm'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
          onClick={async () => {
            await logout()
            router.push('/login')
          }}
        >
          <LogOut className="size-4" />
          লগআউট
        </Button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="মেনু"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground shadow-sm lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">
              {roleTitle} ড্যাশবোর্ড
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              aria-label="হোম"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 sm:hidden"
            >
              <Home className="size-4" />
              <span>হোম</span>
            </Link>

            <Link
              href="/"
              aria-label="হোম"
              className="hidden size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted lg:flex"
            >
              <Home className="size-5" />
            </Link>

            <button
              type="button"
              aria-label="বিজ্ঞপ্তি"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <BellRing className="size-5" />
            </button>

            <Avatar size="sm">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 space-y-4 p-4 sm:p-6 lg:space-y-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}