'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'

import {
  INTELLIGENCE_NAV_ITEMS,
  NavbarDropdown,
  RESOURCES_NAV_ITEMS,
  type NavDropdownItem
} from '@/components/navbar-dropdown'
import { cn } from '@/lib/utils'

/** Tools hub + calculators */
const TOOLS_HREF = '/tools'

function pathActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (pathname === href) return true
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true
  return false
}

function MobileAccordionLink({ item, onNavigate }: { item: NavDropdownItem; onNavigate: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="flex min-h-[48px] items-start gap-3 border-l-2 border-transparent py-3 pl-3 transition-colors hover:border-[#f5a623] hover:bg-[#1a1a1a]"
    >
      <span className="text-lg leading-none" aria-hidden>
        {item.icon}
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-sm font-bold uppercase tracking-wide text-white">
          {item.label}
        </span>
        <span className="mt-0.5 block font-mono text-xs leading-snug text-[#6b7280]">{item.description}</span>
      </span>
    </Link>
  )
}

export function ValifyeNavbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [intelOpen, setIntelOpen] = useState(false)
  const [resOpen, setResOpen] = useState(false)

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setIntelOpen(false)
    setResOpen(false)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    closeDrawer()
  }, [pathname, closeDrawer])

  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 top-0 z-50 h-16 border-b border-[#1f2937] bg-[#0a0a0a]/90 backdrop-blur-md',
          scrolled && 'shadow-lg shadow-black/40'
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-black uppercase tracking-tighter text-white"
            onClick={closeDrawer}
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden md:h-10 md:w-10">
              <Image
                src="/logo-dark.png"
                alt="Valifye"
                width={40}
                height={40}
                className="h-9 w-9 object-cover object-center mix-blend-screen md:h-10 md:w-10"
                priority
              />
            </span>
            <span className="text-lg font-black md:text-xl">Valifye</span>
          </Link>

          {/* Desktop */}
          <nav className="hidden h-full shrink-0 items-center gap-1 md:flex">
            <div className="relative">
              <NavbarDropdown
                label="Intelligence"
                variant="mega"
                items={INTELLIGENCE_NAV_ITEMS}
                pathname={pathname}
              />
            </div>
            <div className="relative">
              <NavbarDropdown
                label="Resources"
                variant="simple"
                items={RESOURCES_NAV_ITEMS}
                pathname={pathname}
                align="right"
              />
            </div>

            <Link
              href="/markets"
              className={cn(
                'inline-flex h-11 items-center rounded-lg px-3 font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors',
                pathActive(pathname, '/markets')
                  ? 'text-[#f5a623]'
                  : 'text-white hover:text-[#f5a623]'
              )}
            >
              Markets
            </Link>
            <Link
              href={TOOLS_HREF}
              className={cn(
                'inline-flex h-11 items-center rounded-lg px-3 font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors',
                pathname?.startsWith('/tools')
                  ? 'text-[#f5a623]'
                  : 'text-white hover:text-[#f5a623]'
              )}
            >
              Tools
            </Link>

            <a
              href="https://app.valifye.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#22c55e] px-5 font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-[#22c55e]/90"
            >
              Access Terminal
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white md:hidden"
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setDrawerOpen((o) => !o)}
          >
            {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 z-[55] bg-black/70 md:hidden"
              onClick={closeDrawer}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed inset-x-0 top-16 z-[60] flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-[#0a0a0a] px-4 pb-6 pt-2 md:hidden"
            >
              <div className="flex flex-col border-b border-[#1f2937] py-2">
                <button
                  type="button"
                  className="flex min-h-[48px] w-full items-center justify-between py-3 text-left font-mono text-xs font-bold uppercase tracking-[0.2em] text-white"
                  onClick={() => setIntelOpen((v) => !v)}
                  aria-expanded={intelOpen}
                >
                  Intelligence
                  <ChevronDown className={cn('h-4 w-4 transition-transform', intelOpen && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {intelOpen ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden border-t border-[#1f2937]/80"
                    >
                      <div className="flex flex-col py-1">
                        {INTELLIGENCE_NAV_ITEMS.map((item) => (
                          <MobileAccordionLink key={item.href} item={item} onNavigate={closeDrawer} />
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="flex flex-col border-b border-[#1f2937] py-2">
                <button
                  type="button"
                  className="flex min-h-[48px] w-full items-center justify-between py-3 text-left font-mono text-xs font-bold uppercase tracking-[0.2em] text-white"
                  onClick={() => setResOpen((v) => !v)}
                  aria-expanded={resOpen}
                >
                  Resources
                  <ChevronDown className={cn('h-4 w-4 transition-transform', resOpen && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {resOpen ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden border-t border-[#1f2937]/80"
                    >
                      <div className="flex flex-col py-1">
                        {RESOURCES_NAV_ITEMS.map((item) => (
                          <MobileAccordionLink key={item.href} item={item} onNavigate={closeDrawer} />
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <Link
                href="/markets"
                onClick={closeDrawer}
                className="min-h-[48px] border-b border-[#1f2937] py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white"
              >
                Markets
              </Link>
              <Link
                href={TOOLS_HREF}
                onClick={closeDrawer}
                className="min-h-[48px] border-b border-[#1f2937] py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white"
              >
                Tools
              </Link>

              <div className="mt-auto w-full shrink-0 border-t border-[#1f2937] pt-4">
                <a
                  href="https://app.valifye.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeDrawer}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#22c55e] py-3.5 text-center font-mono text-sm font-extrabold uppercase tracking-[0.14em] text-black"
                >
                  Access Terminal
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
