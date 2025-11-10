"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function AppointmentsPage() {
  const [role, setRole] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [availableTherapists, setAvailableTherapists] = useState([])
  const [therapistSlots, setTherapistSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showBooking, setShowBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    therapist: "",
    date: "",
    time: "",
    sessionType: "video-call",
  })

  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const generateTimes = (from, to) => {
    // from/to are strings HH:MM; generate 30-min increments
    const [fh, fm] = from.split(":").map(Number)
    const [th, tm] = to.split(":").map(Number)
    const start = fh * 60 + fm
    const end = th * 60 + tm
    const times = []
    for (let m = start; m < end; m += 30) {
      const h = String(Math.floor(m / 60)).padStart(2, "0")
      const mm = String(m % 60).padStart(2, "0")
      times.push(`${h}:${mm}`)
    }
    return times
  }

  useEffect(() => {
    if (!role) return
    if (role !== "patient") return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const [therapistsRes, apptsRes] = await Promise.all([
          fetch("/api/therapists"),
          fetch("/api/appointments"),
        ])
        if (!therapistsRes.ok) throw new Error("Failed to load therapists")
        if (!apptsRes.ok) throw new Error("Failed to load appointments")
        const therapistsData = await therapistsRes.json()
        const apptsData = await apptsRes.json()
        const therapists = (therapistsData.therapists || []).map((t) => ({
          id: t.id,
          name: t.name,
          specialization: t.specialization || "Therapist",
          avatar: (t.name || t.email || "U")
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join("") || "U",
        }))
        const appts = (apptsData.appointments || []).map((a) => ({
          id: a.id,
          therapistId: a.therapistId,
          date: a.date,
          time: a.time,
          status: a.status,
          sessionType: a.sessionType === "in-person" ? "In-Person" : "Video Call",
        }))
        if (active) {
          setAvailableTherapists(therapists)
          setAppointments(appts)
        }
      } catch (e) {
        console.error(e)
        if (active) setError("Could not load initial data")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [role])

  // Fetch slots when therapist changes
  useEffect(() => {
    let active = true
    ;(async () => {
      if (!bookingData.therapist) {
        if (active) setTherapistSlots([])
        return
      }
      try {
        const res = await fetch(`/api/availability?therapistId=${bookingData.therapist}`)
        if (!res.ok) throw new Error("Failed to load availability")
        const data = await res.json()
        const slots = (data.slots || []).map((s) => ({ id: s.id, day: s.day, from: s.from, to: s.to }))
        if (active) setTherapistSlots(slots)
      } catch (e) {
        console.error(e)
        if (active) setTherapistSlots([])
      }
    })()
    return () => { active = false }
  }, [bookingData.therapist])

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

  const handleBookAppointment = async () => {
    try {
      setError("")
      if (!bookingData.therapist || !bookingData.date || !bookingData.time) {
        setError("Please fill in all fields")
        return
      }
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapist: bookingData.therapist,
          date: bookingData.date,
          time: bookingData.time,
          sessionType: bookingData.sessionType,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to book appointment")
      }
      const created = await res.json()
      setAppointments((prev) => [
        ...prev,
        {
          id: created.id,
          therapistId: created.therapistId,
          date: created.date,
          time: created.time,
          status: created.status,
          sessionType: created.sessionType === "in-person" ? "In-Person" : "Video Call",
        },
      ])
      setShowBooking(false)
      setBookingData({ therapist: "", date: "", time: "", sessionType: "video-call" })
    } catch (e) {
      console.error(e)
      setError(e.message || "Could not book appointment")
    }
  }

  const handleCancelAppointment = async (id) => {
    try {
      setError("")
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to cancel appointment")
      }
      setAppointments((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      console.error(e)
      setError(e.message || "Could not cancel appointment")
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-green-100 dark:bg-green-900/30 text-green-700",
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700",
      completed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700",
    }
    return colors[status] || colors.pending
  }

  if (role === "therapist") {
    return (
      <div className="p-6 md:p-8">
        <Card className="p-6 border border-[hsl(var(--border))]">
          <h1 className="text-2xl font-bold mb-2">Appointments are patient-facing</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">As a therapist, manage sessions instead.</p>
          <Link href="/dashboard/sessions">
            <Button className="bg-[hsl(var(--primary))] text-white">Go to Sessions</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Appointments</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">Manage your therapy sessions</p>
        </div>
        {!showBooking && (
          <Button
            onClick={() => setShowBooking(true)}
            className="bg-[hsl(var(--primary))] hover:bg-blue-600 text-white"
          >
            Book New Appointment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        {showBooking && (
          <div className="lg:col-span-1">
            <Card className="p-6 border border-[hsl(var(--border))] sticky top-24">
              <h2 className="font-bold text-lg mb-4">Book an Appointment</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-[hsl(var(--foreground))]">Select Therapist</Label>
                  <select
                    value={bookingData.therapist}
                    onChange={(e) => setBookingData({ ...bookingData, therapist: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]"
                  >
                    <option value="">Choose a therapist...</option>
                    {availableTherapists.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} - {t.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-[hsl(var(--foreground))]">Preferred Date</Label>
                  <Input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="mt-1 bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
                  />
                </div>

                <div>
                  <Label className="text-[hsl(var(--foreground))]">Preferred Time</Label>
                  {(() => {
                    const timesForDay = (() => {
                      if (!bookingData.date) return []
                      const d = new Date(`${bookingData.date}T00:00:00`)
                      if (Number.isNaN(d.getTime())) return []
                      const dayName = weekdayNames[d.getDay()]
                      const slots = therapistSlots.filter((s) => s.day === dayName)
                      const merged = []
                      slots.forEach((s) => {
                        merged.push(...generateTimes(s.from, s.to))
                      })
                      return merged
                    })()
                    if (therapistSlots.length > 0 && timesForDay.length > 0) {
                      return (
                        <select
                          value={bookingData.time}
                          onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                          className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]"
                        >
                          <option value="">Choose a time...</option>
                          {timesForDay.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      )
                    }
                    return (
                      <Input
                        type="time"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                        className="mt-1 bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
                      />
                    )
                  })()}
                  {bookingData.therapist && bookingData.date && therapistSlots.length > 0 && (
                    (() => {
                      const d = new Date(`${bookingData.date}T00:00:00`)
                      const dayName = weekdayNames[d.getDay()]
                      const hasSlots = therapistSlots.some((s) => s.day === dayName)
                      if (!hasSlots) {
                        return (
                          <p className="mt-2 text-sm text-red-600">Selected therapist is not available on this date.</p>
                        )
                      }
                      return null
                    })()
                  )}
                </div>

                <div>
                  <Label className="text-[hsl(var(--foreground))]">Session Type</Label>
                  <select
                    value={bookingData.sessionType}
                    onChange={(e) => setBookingData({ ...bookingData, sessionType: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]"
                  >
                    <option value="video-call">Video Call</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleBookAppointment}
                    className="flex-1 bg-[hsl(var(--primary))] hover:bg-blue-600 text-white"
                  >
                    Request
                  </Button>
                  <Button
                    onClick={() => setShowBooking(false)}
                    variant="outline"
                    className="flex-1 border-[hsl(var(--border))]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Appointments List */}
        <div className={showBooking ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Appointments</h2>

            {loading ? (
              <Card className="p-12 text-center border border-[hsl(var(--border))]">
                <p className="text-[hsl(var(--muted-foreground))]">Loading appointments...</p>
              </Card>
            ) : appointments.length === 0 ? (
              <Card className="p-12 text-center border border-[hsl(var(--border))]">
                <p className="text-[hsl(var(--muted-foreground))] mb-4">No appointments scheduled yet.</p>
                <Button
                  onClick={() => setShowBooking(true)}
                  className="bg-[hsl(var(--primary))] hover:bg-blue-600 text-white"
                >
                  Book Your First Appointment
                </Button>
              </Card>
            ) : (
              appointments.map((apt) => (
                <Card key={apt.id} className="p-6 border border-[hsl(var(--border))]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Therapist</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Appointment details</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(apt.status)}`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-[hsl(var(--muted))] rounded-lg">
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Date</p>
                      <p className="font-semibold">{apt.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Time</p>
                      <p className="font-semibold">{apt.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Type</p>
                      <p className="font-semibold">{apt.sessionType}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-[hsl(var(--border))] bg-transparent">
                      Reschedule
                    </Button>
                    <Button
                      onClick={() => handleCancelAppointment(apt.id)}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Available Therapists */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Available Therapists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTherapists.map((therapist) => (
                <Card key={therapist.id} className="p-4 border border-[hsl(var(--border))] flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {therapist.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{therapist.name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{therapist.specialization}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[hsl(var(--primary))] hover:bg-blue-600 text-white"
                    onClick={() => {
                      setShowBooking(true)
                      setBookingData({ ...bookingData, therapist: therapist.id.toString() })
                    }}
                  >
                    Book
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
