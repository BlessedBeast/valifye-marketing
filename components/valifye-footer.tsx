import Link from 'next/link'
import { Zap } from 'lucide-react'

export function ValifyeFooter() {
  return (
    <footer className="border-t border-border bg-card py-12 font-mono">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-6 py-8">
        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-muted-foreground">
          <Zap className="h-4 w-4" />
          Valifye Intelligence
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Link href="/privacy" className="transition-colors hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-primary">
            Terms of Service
          </Link>
          <a href="mailto:hello@valifye.com" className="transition-colors hover:text-primary">
            Contact
          </a>
        </nav>

        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          © {new Date().getFullYear()} Valifye. All systems operational.
        </div>
      </div>
    </footer>
  )
}