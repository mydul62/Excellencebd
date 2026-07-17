import { Suspense } from 'react'
import { LoginPage } from '@/components/public/login-page'

export const metadata = {
  title: 'Login',
  description: 'Sign in as an admin, teacher, or student to access the demo dashboard.',
}

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">Loading login…</div>}>
      <LoginPage />
    </Suspense>
  )
}
