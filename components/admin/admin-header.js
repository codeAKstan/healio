"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminHeader({ onMenuClick }) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-[hsl(var(--border))] sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="border-[hsl(var(--border))] bg-transparent" size="sm">
              Exit Admin
            </Button>
          </Link>

          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
            AD
          </div>
        </div>
      </div>
    </header>
  )
}
