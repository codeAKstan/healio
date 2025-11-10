"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AvailabilityPage() {
  const [role, setRole] = useState(null)
  const [slots, setSlots] = useState([
    { id: 1, day: "Monday", from: "09:00", to: "12:00" },
    { id: 2, day: "Wednesday", from: "13:00", to: "16:00" },
  ])
  const [newSlot, setNewSlot] = useState({ day: "Monday", from: "09:00", to: "10:00" })

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
          <h1 className="text-2xl font-bold mb-2">Availability is for therapists</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Patients do not manage availability.</p>
        </Card>
      </div>
    )
  }

  const addSlot = () => {
    const id = Math.max(0, ...slots.map(s => s.id)) + 1
    setSlots([...slots, { id, ...newSlot }])
  }

  const removeSlot = (id) => {
    setSlots(slots.filter(s => s.id !== id))
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Availability</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Set weekly times you are available for sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border border-[hsl(var(--border))] lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Add Slot</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm">Day</label>
              <select value={newSlot.day} onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })} className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]">
                {["Monday","Tuesday","Wednesday","Thursday","Friday"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">From</label>
                <input type="time" value={newSlot.from} onChange={(e) => setNewSlot({ ...newSlot, from: e.target.value })} className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]" />
              </div>
              <div>
                <label className="text-sm">To</label>
                <input type="time" value={newSlot.to} onChange={(e) => setNewSlot({ ...newSlot, to: e.target.value })} className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]" />
              </div>
            </div>
            <Button onClick={addSlot} className="w-full bg-[hsl(var(--primary))] text-white">Add</Button>
          </div>
        </Card>

        <Card className="p-6 border border-[hsl(var(--border))] lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Weekly Slots</h2>
          <div className="space-y-3">
            {slots.length === 0 && (
              <div className="p-4 rounded-lg bg-[hsl(var(--muted))]">No slots set yet.</div>
            )}
            {slots.map((s) => (
              <div key={s.id} className="p-4 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-between">
                <div className="font-semibold">{s.day}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">{s.from} - {s.to}</div>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20" onClick={() => removeSlot(s.id)}>Remove</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}