"use client"
import Link from "next/link"

export default function DashboardHeader({ onMenuClick }) {
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
          {/* Notifications */}
          <button className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Avatar */}
          <Link href="/dashboard/profile">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition">
              SJ
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
