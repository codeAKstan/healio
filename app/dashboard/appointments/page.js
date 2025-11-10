"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function AppointmentsPage() {
  const [role, setRole] = useState(null)
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      therapistName: "Dr. Sarah Mitchell",
      specialization: "Anxiety & Stress",
      date: "2025-01-15",
      time: "2:00 PM",
      status: "confirmed",
      sessionType: "Video Call",
    },
    {
      id: 2,
      therapistName: "Dr. Michael Brown",
      specialization: "Depression & Trauma",
      date: "2025-01-22",
      time: "10:30 AM",
      status: "confirmed",
      sessionType: "In-Person",
    },
  ])

  const [showBooking, setShowBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    therapist: "",
    date: "",
    time: "",
    sessionType: "video-call",
  })

  const availableTherapists = [
    { id: 1, name: "Dr. Sarah Mitchell", specialization: "Anxiety & Stress", avatar: "SM" },
    { id: 2, name: "Dr. Michael Brown", specialization: "Depression & Trauma", avatar: "MB" },
    { id: 3, name: "Dr. Emma Williams", specialization: "Life Transitions", avatar: "EW" },
    { id: 4, name: "Dr. Robert Taylor", specialization: "Cognitive Therapy", avatar: "RT" },
  ]

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

  const handleBookAppointment = () => {
    if (!bookingData.therapist || !bookingData.date || !bookingData.time) {
      alert("Please fill in all fields")
      return
    }

    const therapist = availableTherapists.find((t) => t.id === Number.parseInt(bookingData.therapist))
    const newAppointment = {
      id: Math.max(...appointments.map((a) => a.id), 0) + 1,
      therapistName: therapist.name,
      specialization: therapist.specialization,
      date: bookingData.date,
      time: bookingData.time,
      status: "pending",
      sessionType: bookingData.sessionType === "video-call" ? "Video Call" : "In-Person",
    }

    setAppointments([...appointments, newAppointment])
    setShowBooking(false)
    setBookingData({ therapist: "", date: "", time: "", sessionType: "video-call" })
    alert("Appointment request sent!")
  }

  const handleCancelAppointment = (id) => {
    setAppointments(appointments.filter((a) => a.id !== id))
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
                  <Input
                    type="time"
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    className="mt-1 bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
                  />
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

            {appointments.length === 0 ? (
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
                      <h3 className="text-lg font-bold">{apt.therapistName}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{apt.specialization}</p>
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
