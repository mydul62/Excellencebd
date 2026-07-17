import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bright Future Coaching Center — Management System',
  description:
    'A modern coaching center management platform for admins, teachers, and students. Manage courses, enrollments, notices, and more.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2563EB',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light bg-background">
     <body className="font-sans antialiased
     
     " cz-shortcut-listen="true">
  <Providers>{children}</Providers>
  <Toaster position="top-right" richColors />
  {process.env.NODE_ENV === 'production' && <Analytics />}
</body>
    </html>
  )
}
