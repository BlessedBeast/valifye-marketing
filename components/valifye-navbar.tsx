import Link from 'next/link'
import { Zap } from 'lucide-react'

export function ValifyeNavbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6 font-mono">
      <Link href="/" className="flex items-center gap-2 font-black uppercase tracking-widest text-foreground">
        <Zap className="h-5 w-5 fill-primary text-primary" />
        Valifye
      </Link>
      
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-8">
        <Link href="/#how-it-works" className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          How it Works
        </Link>
        <Link href="/#pricing" className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          Pricing
        </Link>
        <Link href="/#faq" className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          FAQ
        </Link>
        <Link href="/ideas" className="border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary/80">
          Database
        </Link>
      </nav>
    </header>
  )
}