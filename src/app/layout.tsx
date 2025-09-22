import "./globals.css"
import type { Metadata } from "next"
import Navbar from "@/components/site/navbar"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/contexts/ThemeContext"

export const metadata: Metadata = {
  title: "Vibe Tasks",
  description: "Mini Team Task Manager — Vibe-coding MVP",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
