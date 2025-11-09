"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/dashboard/mood", icon: "😊", label: "Mood Tracker" },
    { href: "/dashboard/journal", icon: "📝", label: "Journal" },
    { href: "/dashboard/resources", icon: "📚", label: "Resources" },
    { href: "/dashboard/appointments", icon: "📅", label: "Appointments" },
    { href: "/dashboard/profile", icon: "👤", label: "Profile" },
  ]

  const isActive = (href) => pathname === href

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed md:static w-64 h-screen bg-white dark:bg-slate-900 border-r border-[hsl(var(--border))] z-50 transform transition-transform md:translate-x-0 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-bold text-lg">Healio</span>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.href)
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[hsl(var(--border))]">
          <Button
            variant="outline"
            className="w-full border-[hsl(var(--border))] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
          >
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}
