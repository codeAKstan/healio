"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SessionsPage() {
  const [role, setRole] = useState(null)
  const [sessions, setSessions] = useState([
    { id: 1, client: "Alex Johnson", date: "2025-11-10", time: "10:00 AM", status: "confirmed", type: "Video" },
    { id: 2, client: "Priya Singh", date: "2025-11-11", time: "2:30 PM", status: "pending", type: "In-Person" },
  ])

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
        {sessions.map((s) => (
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
              <Button variant="outline" className="border-[hsl(var(--border))]">Confirm</Button>
              <Button variant="outline" className="border-[hsl(var(--border))]">Reschedule</Button>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20">Cancel</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}