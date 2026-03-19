import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Valifye | Forensic Market Intelligence Engine',
  description:
    'Stop building in the dark. Discover validated micro-SaaS opportunities and run them through our live intelligence engine.',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml'
      }
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  },
  alternates: {
    types: {
      'application/rss+xml': '/sitemap.xml'
    }
  },
  themeColor: '#000000'
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="mx-auto max-w-[1280px] px-4 py-8 pt-24 sm:px-6 sm:pt-24 lg:px-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
