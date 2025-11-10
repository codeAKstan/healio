"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ClientsPage() {
  const [role, setRole] = useState(null)

  const [clients, setClients] = useState([
    { id: 1, name: "Alex Johnson", lastSession: "2025-11-02", status: "active" },
    { id: 2, name: "Priya Singh", lastSession: "2025-10-28", status: "active" },
    { id: 3, name: "Carlos Diaz", lastSession: "2025-10-15", status: "inactive" },
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
    return () => {
      active = false
    }
  }, [])

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
        <Button className="bg-[hsl(var(--primary))] text-white">Add Client</Button>
      </div>

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

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="border-[hsl(var(--border))]">View Profile</Button>
              <Button variant="outline" className="border-[hsl(var(--border))]">Message</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}