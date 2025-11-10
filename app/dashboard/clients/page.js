"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function ClientsPage() {
  const [role, setRole] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appointments, setAppointments] = useState([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) return
        const data = await res.json()
        if (active) setRole(data?.role || null)
      } catch (e) {}
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (role !== "therapist") return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const res = await fetch("/api/appointments")
        if (!res.ok) throw new Error("Failed to load clients")
        const data = await res.json()
        const appts = Array.isArray(data.appointments) ? data.appointments : []
        setAppointments(appts)
        const byPatient = new Map()
        const today = new Date()
        const toDate = (s) => {
          const d = new Date(`${s}T00:00:00`)
          return Number.isNaN(d.getTime()) ? null : d
        }
        appts.forEach((a) => {
          const pid = a.patientId
          const name = a.patientName || "Patient"
          const d = toDate(a.date)
          if (!byPatient.has(pid)) {
            byPatient.set(pid, { id: pid, name, lastSession: d, upcoming: false })
          } else {
            const existing = byPatient.get(pid)
            if (!existing.name || existing.name === "Patient") existing.name = name
            if (d && (!existing.lastSession || d > existing.lastSession)) existing.lastSession = d
          }
          if (d && d >= today) {
            const existing = byPatient.get(pid)
            existing.upcoming = true
          }
        })
        const items = Array.from(byPatient.values()).map((p) => {
          const lastStr = p.lastSession
            ? `${p.lastSession.getFullYear()}-${String(p.lastSession.getMonth() + 1).padStart(2, "0")}-${String(p.lastSession.getDate()).padStart(2, "0")}`
            : "—"
          const daysAgo = p.lastSession ? Math.floor((today - p.lastSession) / (1000 * 60 * 60 * 24)) : Infinity
          const activeStatus = p.upcoming || daysAgo <= 30 ? "active" : "inactive"
          return { id: p.id, name: p.name, lastSession: lastStr, status: activeStatus }
        })
        if (active) setClients(items)
      } catch (e) {
        console.error(e)
        if (active) setError("Could not load clients")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [role])

  if (role && role !== "therapist") {
    return (
      <div className="p-6 md:p-8">
        <Card className="p-6 border border-[hsl(var(--border))]">
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-[hsl(var(--muted-foreground))]">This page is for therapists. Patients can view their sessions under Appointments.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Clients</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">Manage your client list and review recent sessions</p>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center border border-[hsl(var(--border))]">
          <p className="text-[hsl(var(--muted-foreground))]">Loading clients...</p>
        </Card>
      ) : clients.length === 0 ? (
        <Card className="p-12 text-center border border-[hsl(var(--border))]">
          <p className="text-[hsl(var(--muted-foreground))]">No clients yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((c) => (
          <Card key={c.id} className="p-6 border border-[hsl(var(--border))]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{c.name}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Last session: {c.lastSession}</p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${c.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30"}`}>{c.status}</span>
            </div>

            
          </Card>
        ))}
      </div>
      )}

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedClient?.name || "Client"}</DialogTitle>
            <DialogDescription>
              Last session: {selectedClient?.lastSession || "—"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedClient?.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30"}`}>{selectedClient?.status}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Status</span>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recent sessions</h4>
              <div className="space-y-2 max-h-64 overflow-auto">
                {appointments.filter(a => a.patientId === selectedClient?.id).sort((a,b) => {
                  const da = new Date(`${a.date}T00:00:00`)
                  const db = new Date(`${b.date}T00:00:00`)
                  return db - da
                }).map((a) => (
                  <div key={a._id} className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">{a.date} • {a.time}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${a.status === "confirmed" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : a.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30"}`}>{a.status}</span>
                  </div>
                ))}
                {appointments.filter(a => a.patientId === selectedClient?.id).length === 0 && (
                  <p className="text-[hsl(var(--muted-foreground))]">No sessions found.</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="border-[hsl(var(--border))]" onClick={() => setProfileOpen(false)}>Close</Button>
              <Button variant="default">Message</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}