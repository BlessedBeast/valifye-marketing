'use client'

import { useState } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { ValifyeButton } from '@/components/ui/valifye-button'

interface NavbarProps {
  onJoinWaitlist?: () => void
}

export function ValifyeNavbar({ onJoinWaitlist }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <span className="text-sm font-black text-primary-foreground">V</span>
          </div>
          <span className="text-lg font-bold text-foreground">Valifye</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById('how-it-works')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById('pricing')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </button>
          <Link
            href="/ideas"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Market Intelligence
          </Link>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById('faq')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <ValifyeButton
            size="sm"
            onClick={
              onJoinWaitlist ??
              (() =>
                document
                  .getElementById('pricing')
                  ?.scrollIntoView({ behavior: 'smooth' }))
            }
            className="hidden md:inline-flex"
          >
            Join Waitlist
          </ValifyeButton>
          <button
            type="button"
            className="p-2 text-muted-foreground md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-1 border-t border-border/50 bg-background px-4 pb-4 pt-2 md:hidden">
          <button
            type="button"
            onClick={() => {
              document
                .getElementById('how-it-works')
                ?.scrollIntoView({ behavior: 'smooth' })
              setMobileOpen(false)
            }}
            className="block w-full rounded-xl px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => {
              document
                .getElementById('pricing')
                ?.scrollIntoView({ behavior: 'smooth' })
              setMobileOpen(false)
            }}
            className="block w-full rounded-xl px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            Pricing
          </button>
          <Link
            href="/ideas"
            className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Market Intelligence
          </Link>
          <button
            type="button"
            onClick={() => {
              document
                .getElementById('faq')
                ?.scrollIntoView({ behavior: 'smooth' })
              setMobileOpen(false)
            }}
            className="block w-full rounded-xl px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            FAQ
          </button>
          <div className="pt-2">
            <ValifyeButton
              onClick={() => {
                document
                  .getElementById('pricing')
                  ?.scrollIntoView({ behavior: 'smooth' })
                setMobileOpen(false)
              }}
              className="w-full"
            >
              Join Waitlist
            </ValifyeButton>
          </div>
        </div>
      )}
    </nav>
  )
}

