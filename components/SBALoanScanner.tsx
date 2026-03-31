'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

const QUESTIONS = [
  'Do you have exact Customer Acquisition Cost (CAC) data for your zip code?',
  'Can you name the top 3 dominant competitors within a 2-mile radius?',
  'Do you have a 2026 local zoning clearance for your specific street?',
  'Is the search volume for your niche in your city currently rising?',
  'Have you calculated breakeven using local median wages instead of national averages?'
] as const

const POINTS_PER_YES = 20

function scoreFromAnswers(answers: (boolean | null)[]) {
  return answers.reduce(
    (acc, a) => acc + (a === true ? POINTS_PER_YES : 0),
    0
  )
}

type ResultBand = 'reject' | 'borderline' | 'ready'

type SBALoanScannerProps = {
  currencySymbol?: string
}

function getResultBand(score: number): ResultBand {
  if (score < 60) return 'reject'
  if (score === 100) return 'ready'
  return 'borderline'
}

export function SBALoanScanner({ currencySymbol = '$' }: SBALoanScannerProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [answers, setAnswers] = useState<(boolean | null)[]>([
    null,
    null,
    null,
    null,
    null
  ])

  const currentValue =
    answers[stepIndex] === true
      ? 'yes'
      : answers[stepIndex] === false
        ? 'no'
        : undefined

  const score = useMemo(
    () => (showResults ? scoreFromAnswers(answers) : 0),
    [answers, showResults]
  )

  const band = showResults ? getResultBand(score) : null

  const progressIndicatorClass =
    band === 'reject'
      ? 'bg-red-500'
      : band === 'borderline'
        ? 'bg-amber-400'
        : band === 'ready'
          ? 'bg-emerald-500'
          : 'bg-slate-500'

  const progressTrackClass =
    band === 'reject'
      ? 'bg-red-950/50'
      : band === 'borderline'
        ? 'bg-amber-950/40'
        : band === 'ready'
          ? 'bg-emerald-950/40'
          : 'bg-slate-800'

  function setCurrentAnswer(yes: boolean) {
    setAnswers((prev) => {
      const next = [...prev]
      next[stepIndex] = yes
      return next
    })
  }

  function handleNext() {
    if (answers[stepIndex] === null) return
    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex((s) => s + 1)
    } else {
      setShowResults(true)
    }
  }

  function handleBack() {
    if (showResults) {
      setShowResults(false)
      setStepIndex(QUESTIONS.length - 1)
      return
    }
    if (stepIndex > 0) setStepIndex((s) => s - 1)
  }

  function restart() {
    setAnswers([null, null, null, null, null])
    setStepIndex(0)
    setShowResults(false)
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-700/80 bg-[#070f1a] p-1 shadow-2xl shadow-black/40',
        'ring-1 ring-slate-800/60'
      )}
    >
      <Card className="border-slate-800 bg-slate-800 text-slate-100 shadow-none">
        {!showResults ? (
          <>
            <CardHeader className="space-y-3 border-b border-slate-700/80 pb-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                SBA loan readiness · interrogation
              </p>
              <CardTitle className="font-serif text-2xl font-semibold leading-snug tracking-tight text-slate-50 md:text-[1.65rem]">
                Question {stepIndex + 1} of {QUESTIONS.length}
              </CardTitle>
              <CardDescription className="font-mono text-xs text-slate-400">
                Answer yes or no. Yes earns +{POINTS_PER_YES} points toward your
                local proof score.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <p className="font-serif text-lg leading-relaxed text-slate-200 md:text-xl">
                {QUESTIONS[stepIndex]}
              </p>

              <RadioGroup
                value={currentValue}
                onValueChange={(v) => {
                  if (v === 'yes') setCurrentAnswer(true)
                  if (v === 'no') setCurrentAnswer(false)
                }}
                className="flex flex-wrap gap-8"
              >
                <label
                  htmlFor={`q${stepIndex}-yes`}
                  className="flex cursor-pointer items-center gap-3 font-mono text-sm text-slate-300"
                >
                  <RadioGroupItem
                    value="yes"
                    id={`q${stepIndex}-yes`}
                    className="border-slate-500 text-emerald-400"
                  />
                  Yes (+{POINTS_PER_YES})
                </label>
                <label
                  htmlFor={`q${stepIndex}-no`}
                  className="flex cursor-pointer items-center gap-3 font-mono text-sm text-slate-300"
                >
                  <RadioGroupItem
                    value="no"
                    id={`q${stepIndex}-no`}
                    className="border-slate-500 text-slate-300"
                  />
                  No (0)
                </label>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/80 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={stepIndex === 0}
                className="font-mono text-xs uppercase tracking-wider text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 disabled:opacity-30"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={answers[stepIndex] === null}
                className="bg-slate-100 font-mono text-xs font-semibold uppercase tracking-widest text-slate-900 hover:bg-white"
              >
                {stepIndex === QUESTIONS.length - 1 ? 'View results' : 'Next'}
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-3 border-b border-slate-700/80 pb-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                Results
              </p>
              <CardTitle className="font-serif text-2xl font-semibold tracking-tight text-slate-50">
                Local proof score
              </CardTitle>
              <CardDescription className="font-mono text-xs text-slate-400">
                Maximum 100 — five questions at {POINTS_PER_YES} points each.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="flex items-end justify-between gap-4">
                <p className="font-terminal-mono text-4xl font-bold tabular-nums tracking-tight text-slate-50">
                  {score}
                  <span className="text-2xl font-semibold text-slate-500">
                    /100
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Progress
                  value={score}
                  max={100}
                  className={cn('h-3', progressTrackClass)}
                  indicatorClassName={progressIndicatorClass}
                />
              </div>

              <p
                className={cn(
                  'font-serif text-base leading-relaxed md:text-lg',
                  band === 'reject' && 'text-red-400',
                  band === 'borderline' && 'text-amber-300',
                  band === 'ready' && 'text-emerald-400'
                )}
              >
                {band === 'reject' && (
                  <>
                    🚨 HIGH REJECTION RISK. Underwriters will flag this for
                    &apos;Insufficient Local Market Proof&apos;.
                  </>
                )}
                {band === 'borderline' && (
                  <>
                    ⚠️ BORDERLINE. You need harder data to secure a low-interest
                    rate.
                  </>
                )}
                {band === 'ready' && <>🛡️ LENDER READY.</>}
              </p>

              <div className="rounded-xl border border-slate-700 bg-[#070f1a] p-5">
                <p className="font-serif text-sm leading-relaxed text-slate-300">
                  Don&apos;t guess on your application. Attach a 10-page
                  data-backed Valifye Audit to your SBA package.{' '}
                  <span className="font-mono text-slate-200">
                    Get the Audit — $49
                  </span>
                </p>
                <Button
                  asChild
                  className="mt-4 w-full bg-emerald-600 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-emerald-500 sm:w-auto"
                >
                  <Link href="/audit">Download Data Pack</Link>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-700/80 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={restart}
                className="font-mono text-xs uppercase tracking-wider text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
              >
                Run interrogation again
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
