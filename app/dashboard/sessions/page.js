"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SessionsPage() {
  const [role, setRole] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (role !== "therapist") return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const res = await fetch("/api/appointments")
        if (!res.ok) throw new Error("Failed to load sessions")
        const data = await res.json()
        const appts = (data.appointments || []).map((a) => ({
          id: a.id,
          client: a.patientName || "Patient",
          date: a.date,
          time: formatTime(a.time),
          status: a.status,
          type: a.sessionType === "in-person" ? "In-Person" : "Video",
        }))
        if (active) setSessions(appts)
      } catch (e) {
        console.error(e)
        if (active) setError("Could not load sessions")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [role])

  const formatTime = (t) => {
    // convert "HH:MM" to 12-hour like "10:00 AM"
    if (!t || typeof t !== "string") return t || ""
    const [hStr, mStr] = t.split(":")
    let h = parseInt(hStr, 10)
    const m = mStr
    const ampm = h >= 12 ? "PM" : "AM"
    h = h % 12
    if (h === 0) h = 12
    return `${h}:${m} ${ampm}`
  }

  const handleCancel = async (id) => {
    try {
      setError("")
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || "Failed to cancel session")
      }
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      console.error(e)
      setError(e.message || "Could not cancel session")
    }
  }

  if (role && role !== "therapist") {
    return (
      <div className="p-6 md:p-8">
        <Card className="p-6 border border-[hsl(var(--border))]">
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-[hsl(var(--muted-foreground))]">This page is for therapists. Patients can manage bookings under Appointments.</p>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-green-100 dark:bg-green-900/30 text-green-700",
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700",
      completed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700",
    }
    return colors[status] || colors.pending
  }

  const handleConfirm = async (id) => {
    try {
      setError("")
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || "Failed to confirm session")
      }
      const updated = await res.json()
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: updated.status } : s)))
    } catch (e) {
      console.error(e)
      setError(e.message || "Could not confirm session")
    }
  }

  const handleReschedule = async (id) => {
    try {
      setError("")
      const date = window.prompt("Enter new date (YYYY-MM-DD)")
      if (!date) return
      const time = window.prompt("Enter new time (HH:MM, 24h)")
      if (!time) return
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || "Failed to reschedule session")
      }
      const updated = await res.json()
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, date: updated.date, time: formatTime(updated.time) } : s)))
    } catch (e) {
      console.error(e)
      setError(e.message || "Could not reschedule session")
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Sessions</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">Track upcoming, pending, and past therapy sessions</p>
        </div>
        <Button className="bg-[hsl(var(--primary))] text-white">Create Session</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center border border-[hsl(var(--border))]">
            <p className="text-[hsl(var(--muted-foreground))]">Loading sessions...</p>
          </Card>
        ) : sessions.length === 0 ? (
          <Card className="p-12 text-center border border-[hsl(var(--border))]">
            <p className="text-[hsl(var(--muted-foreground))]">No sessions yet.</p>
          </Card>
        ) : (
          sessions.map((s) => (
          <Card key={s.id} className="p-6 border border-[hsl(var(--border))]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{s.client}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{s.type} session</p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(s.status)}`}>{s.status}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-[hsl(var(--muted))] rounded-lg">
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Date</p>
                <p className="font-semibold">{s.date}</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Time</p>
                <p className="font-semibold">{s.time}</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Type</p>
                <p className="font-semibold">{s.type}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleConfirm(s.id)} variant="outline" className="border-[hsl(var(--border))]">Confirm</Button>
              <Button onClick={() => handleReschedule(s.id)} variant="outline" className="border-[hsl(var(--border))]">Reschedule</Button>
              <Button
                onClick={() => handleCancel(s.id)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )))
        }
      </div>
    </div>
  )
}