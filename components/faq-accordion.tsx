'use client'

import { useState } from 'react'

export function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={faq.q} className="overflow-hidden rounded-xl border border-[#1f2937]">
          <button
            type="button"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#111111]"
          >
            <span className="pr-4 text-base font-semibold text-white">{faq.q}</span>
            <span
              className={`flex-shrink-0 font-mono text-xl text-[#f5a623] transition-transform duration-200 ${
                open === i ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="border-t border-[#1f2937] px-6 pb-5 pt-4 text-sm leading-relaxed text-[#9ca3af]">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
