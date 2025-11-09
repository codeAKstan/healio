"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", icon: "📊", label: "Dashboard" },
    { href: "/admin/users", icon: "👥", label: "Users" },
    { href: "/admin/therapists", icon: "👨‍⚕️", label: "Therapists" },
    { href: "/admin/reports", icon: "📈", label: "Reports" },
    { href: "/admin/settings", icon: "⚙️", label: "Settings" },
  ]

  const isActive = (href) => pathname === href

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      <div
        className={`fixed md:static w-64 h-screen bg-white dark:bg-slate-900 border-r border-[hsl(var(--border))] z-50 transform transition-transform md:translate-x-0 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-lg">Healio Admin</span>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.href)
                      ? "bg-red-500 text-white"
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
      </div>
    </>
  )
}
