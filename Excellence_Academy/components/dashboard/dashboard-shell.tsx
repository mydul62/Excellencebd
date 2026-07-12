'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BellRing,
  BookOpen,
  GraduationCap,
  Home,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  UserCircle2,
  Users,
} from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import type { Role } from '@/types'

const navConfig: Record<Role, { label: string; href: string; icon: typeof LayoutGrid }[]> = {
  admin: [
    { label: 'ড্যাশবোর্ড', href: '/dashboard/admin', icon: LayoutGrid },
    { label: 'শিক্ষার্থীরা', href: '/dashboard/admin/students', icon: Users },
    { label: 'শিক্ষকগণ', href: '/dashboard/admin/teachers', icon: GraduationCap },
    { label: 'কোর্সসমূহ', href: '/dashboard/admin/courses', icon: BookOpen },
    { label: 'নোটিশ', href: '/dashboard/admin/notices', icon: BellRing },
  ],
  teacher: [
    { label: 'ড্যাশবোর্ড', href: '/dashboard/teacher', icon: LayoutGrid },
    { label: 'আমার কোর্স', href: '/dashboard/teacher/courses', icon: BookOpen },
    { label: 'শিক্ষার্থীরা', href: '/dashboard/teacher/students', icon: Users },
    { label: 'নোটিশ', href: '/dashboard/teacher/notices', icon: BellRing },
    { label: 'প্রোফাইল', href: '/dashboard/teacher/profile', icon: UserCircle2 },
  ],
  student: [
    { label: 'ড্যাশবোর্ড', href: '/dashboard/student', icon: LayoutGrid },
    { label: 'আমার কোর্স', href: '/dashboard/student/courses', icon: BookOpen },
    { label: 'কোর্স ব্রাউজ', href: '/dashboard/student/browse', icon: BarChart3 },
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
    <div className="flex min-h-screen bg-[#f4f6fb]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-[linear-gradient(180deg,#2f3fa8_0%,#1f2c85_100%)] px-4 py-6 text-white">
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
          onClick={logout}
        >
          <LogOut className="size-4" />
          লগআউট
        </Button>
      </aside>

      {/* Main column */}
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 bg-white px-8 py-4">
          <h1 className="font-display text-xl font-semibold text-foreground">
            {roleTitle} ড্যাশবোর্ড
          </h1>

          <div className="flex items-center gap-4">
  

<Link
  href="/"
  aria-label="হোম"
  className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
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

        <main className="flex-1 space-y-6 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}