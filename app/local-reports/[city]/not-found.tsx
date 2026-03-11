import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

export default function LocalReportsCityNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 border border-border bg-card p-10 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-black uppercase tracking-[0.2em] text-foreground">
            City Not Found
          </h1>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            No local market hub exists for this city. Check the spelling or browse the main directory.
          </p>
          <Link
            href="/local-reports"
            className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Local Reports
          </Link>
        </div>
      </main>
      <ValifyeFooter />
    </div>
  )
}
