"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DashboardHeader({ onMenuClick }) {
  const [initials, setInitials] = useState("?")
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) return
        const data = await res.json()
        const name = data?.name || data?.email || "User"
        const parts = String(name).trim().split(/\s+/)
        const computed = (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase()
        if (active) setInitials(computed || (String(name)[0] || "?").toUpperCase())
      } catch (e) {
        // noop
      }
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/notifications?unread=true")
        if (!res.ok) return
        const data = await res.json()
        if (active) {
          setUnread(data.unread || 0)
          setNotifications(data.notifications || [])
        }
      } catch (e) {}
    })()
    return () => { active = false }
  }, [])

  const markRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" })
      if (!res.ok) return
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnread((u) => Math.max(0, u - 1))
    } catch (e) {}
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-[hsl(var(--border))] sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1"></div>

        <div className="flex items-center gap-4 relative">
          {/* Notifications */}
          <button
            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition relative"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-14 top-12 w-80 bg-white dark:bg-slate-800 border border-[hsl(var(--border))] rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <span className="font-semibold">Notifications</span>
                <button
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  onClick={() => setNotifOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-[hsl(var(--muted-foreground))]">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 border-b border-[hsl(var(--border))]">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">{n.body}</p>
                        </div>
                        {!n.read && (
                          <button
                            className="text-xs px-2 py-1 rounded bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground))]/10"
                            onClick={() => markRead(n.id)}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Profile Avatar */}
          <Link href="/dashboard/profile">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition">
              {initials}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
