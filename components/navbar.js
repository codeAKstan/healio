"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-[hsl(var(--border))] shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-bold text-xl hidden sm:inline">Healio</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
            >
              Sign In
            </Link>
            <Link href="/register">
              <Button className="bg-[hsl(var(--primary))] hover:bg-blue-600 text-white">Get Started</Button>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/#features"
              className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] py-2"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] py-2"
            >
              Sign In
            </Link>
            <Link href="/register">
              <Button className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
