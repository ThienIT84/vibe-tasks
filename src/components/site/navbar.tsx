'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Navbar() {
  return (
    <header className={cn("border-b")}>
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">Vibe Tasks</Link>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
          <Link href="/sign-in"><Button>Sign In</Button></Link>
        </nav>
      </div>
    </header>
  )
}
