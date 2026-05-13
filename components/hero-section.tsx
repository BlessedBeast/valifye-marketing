'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const IDEAS = [
  'B2B Invoicing SaaS — Austin, TX',
  'AI Resume Builder — Miami, FL',
  'Franchise Analytics — London, UK'
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const }
  }
}

function ForensicAuditMockup() {
  const [typedIdea, setTypedIdea] = useState('')
  const [ideaIndex, setIdeaIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    const idea = IDEAS[ideaIndex % IDEAS.length] ?? ''

    const typeIn = async () => {
      for (let i = 0; i <= idea.length && !cancelled; i++) {
        setTypedIdea(idea.slice(0, i))
        await new Promise((r) => setTimeout(r, 40))
      }
      await new Promise((r) => setTimeout(r, 3000))
      for (let i = idea.length; i >= 0 && !cancelled; i--) {
        setTypedIdea(idea.slice(0, i))
        await new Promise((r) => setTimeout(r, 15))
      }
      await new Promise((r) => setTimeout(r, 250))
      if (!cancelled) setIdeaIndex((j) => j + 1)
    }

    void typeIn()
    return () => {
      cancelled = true
    }
  }, [ideaIndex])

  const rowBase = 0.6
  const rowStep = 0.15

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.4, ease: 'easeOut' }}
      className={cn(
        'max-w-full overflow-hidden rounded-2xl border border-[#1f2937] bg-[#0d0d0d]',
        'shadow-[0_0_80px_rgba(245,166,35,0.08)]',
        'md:rotate-1'
      )}
    >
      <div
        className="relative flex items-center justify-between border-b border-[#1f2937] bg-[#111111] px-4 py-2.5"
        role="presentation"
      >
        <span className="flex shrink-0 items-center gap-2" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
          <span className="h-2 w-2 rounded-full bg-[#eab308]" />
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
        </span>
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xs tracking-widest text-[#4b5563]">
          FORENSIC.AUDIT.LIVE
        </span>
        <span className="shrink-0 font-mono text-xs text-[#ef4444]">
          <span className="inline-flex animate-pulse items-center gap-1">
            REC <span className="text-[10px]">●</span>
          </span>
        </span>
      </div>

      <div className="space-y-0 px-4 py-2 md:px-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowBase, duration: 0.25 }}
          className="flex items-start justify-between gap-3 border-b border-[#1f2937]/50 py-3"
        >
          <span className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#4b5563]">
            Idea analyzed
          </span>
          <span className="max-w-[min(100%,14rem)] text-right font-mono text-sm font-medium leading-snug text-white md:max-w-none">
            {typedIdea}
            <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-[#f5a623] animate-pulse" aria-hidden />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowBase + rowStep, duration: 0.25 }}
          className="border-b border-[#1f2937]/50 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#4b5563]">
              Whitespace score
            </span>
            <span className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-black text-white">7.4</span>
              <span className="text-xs text-[#6b7280]">/10</span>
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#1f2937]">
            <motion.div
              className="h-full rounded-full bg-[#f5a623]"
              initial={{ width: 0 }}
              animate={{ width: '74%' }}
              transition={{ duration: 0.8, delay: rowBase + rowStep + 0.1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowBase + rowStep * 2, duration: 0.25 }}
          className="flex items-center justify-between gap-3 border-b border-[#1f2937]/50 py-3"
        >
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#4b5563]">
            Verdict
          </span>
          <span className="rounded bg-[#f5a623] px-2 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black">
            BUILD — CONTESTED
          </span>
        </motion.div>

        <MetricRow delay={rowBase + rowStep * 3} label="Competitors mapped" value="14" valueClass="text-right text-white" />
        <MetricRow
          delay={rowBase + rowStep * 4}
          label="Pricing gaps"
          value="3 detected"
          valueClass="text-[#22c55e]"
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowBase + rowStep * 5, duration: 0.25 }}
          className="flex items-center justify-between gap-3 border-b border-[#1f2937]/50 py-3"
        >
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#4b5563]">
            Demand signal
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-sm font-medium text-[#22c55e]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            RISING
          </span>
        </motion.div>
        <MetricRow delay={rowBase + rowStep * 6} label="Market size" value="$2.1B TAM" valueClass="text-white" />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowBase + rowStep * 7, duration: 0.25 }}
          className="flex items-center justify-between gap-3 border-b border-[#1f2937]/50 py-3"
        >
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#4b5563]">
            Strategic angle
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1 pl-4">
            <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-[#1f2937]">
              <div className="h-full w-[60%] rounded-full bg-[#4b5563]" />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
              LOCKED
            </span>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-[#1f2937]/80 px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-[#374151]">
        Sample readout · Battlefield audit · Anonymized
      </div>
    </motion.div>
  )
}

function MetricRow({
  delay,
  label,
  value,
  valueClass
}: {
  delay: number
  label: string
  value: string
  valueClass: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="flex items-center justify-between gap-3 border-b border-[#1f2937]/50 py-3"
    >
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#4b5563]">
        {label}
      </span>
      <span className={`font-mono text-sm font-medium ${valueClass}`}>{value}</span>
    </motion.div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#1f2937] bg-[#0a0a0a]">
      <div className="pointer-events-none absolute inset-0 bg-hero-dots" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-hero-amber-radial" aria-hidden />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col-reverse gap-10 px-4 py-12 md:flex-row md:items-center md:gap-8 md:px-8 md:py-16 lg:gap-12">
        {/* Left: copy + CTAs */}
        <div className="flex w-full flex-col md:w-[55%]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0 }}
            className="mb-4 max-w-full truncate font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b7280] md:max-w-none md:whitespace-normal"
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-[#22c55e] animate-pulse">●</span>
              <span className="text-[#6b7280]">SYSTEM ONLINE</span>
            </span>
            <span className="px-2 text-[#1f2937]">|</span>
            <span>FORENSIC LOGIC V2.4</span>
            <span className="hidden px-2 text-[#1f2937] md:inline">|</span>
            <span className="hidden md:inline">SIGNAL #02912</span>
          </motion.p>

        <motion.div
          className="flex flex-col"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div className="font-black leading-[0.9] tracking-tighter text-white">
            <motion.h1
              variants={item}
              className="text-[2.5rem] md:text-[clamp(2.75rem,6vw,4.5rem)] lg:text-[clamp(3rem,7vw,5.5rem)]"
            >
              Stop Building
            </motion.h1>
            <motion.h1
              variants={item}
              className="text-[2.5rem] md:text-[clamp(2.75rem,6vw,4.5rem)] lg:text-[clamp(3rem,7vw,5.5rem)]"
            >
              In The Dark.
            </motion.h1>
          </div>

          <motion.p
            variants={item}
            className="mt-6 max-w-[480px] text-base leading-relaxed text-[#9ca3af] md:text-lg"
          >
            Get intelligence you can execute — forensic market blueprints, live verdicts, and
            AI-powered forensics for founders who build to win, not to guess.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <a
              href="https://app.valifye.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#f5a623] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#f5a623]/90 sm:w-auto"
            >
              START FREE — No Credit Card
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </a>
            <a
              href="#markets"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-[#1f2937] px-6 py-3 text-sm font-bold text-white transition hover:border-[#f5a623]/40 hover:text-[#f5a623] sm:w-auto"
            >
              VIEW MARKET BLUEPRINTS
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
            </a>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center font-mono text-[11px] uppercase tracking-wide text-[#6b7280] md:justify-start md:text-left"
          >
            <span className="inline-flex items-center gap-1.5 text-[#22c55e]">
              ✓ <span className="text-[#6b7280]">No credit card</span>
            </span>
            <span className="text-[#1f2937]">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#f5a623]">⚡</span>
              <span>Under 60s delivery</span>
            </span>
            <span className="text-[#1f2937]">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span>🔒</span>
              <span>Truth Guarantee — refundable</span>
            </span>
          </motion.p>
        </motion.div>
        </div>

        {/* Right: terminal mock */}
        <div className="w-full md:w-[45%]">
          <ForensicAuditMockup />
        </div>
      </div>
    </section>
  )
}
