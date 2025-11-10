"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [userData, setUserData] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [moods, setMoods] = useState([])
  const [loadingMoods, setLoadingMoods] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          throw new Error("failed")
        }
        const data = await res.json()
        if (active) setUserData(data)
      } catch (e) {
        // noop: middleware/layout should redirect unauthenticated
      } finally {
        if (active) setLoadingUser(false)
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
        const res = await fetch("/api/mood")
        if (!res.ok) throw new Error("Failed to load moods")
        const json = await res.json()
        const list = (json.moods || []).map((m) => ({
          date: new Date(m.createdAt).toISOString().split("T")[0],
          mood: m.mood,
          intensity: m.intensity,
          notes: m.notes,
        }))
        if (active) setMoods(list)
      } catch (e) {
        // noop
      } finally {
        if (active) setLoadingMoods(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const moodStats = {
    happy: moods.filter((m) => m.mood === "happy").length,
    sad: moods.filter((m) => m.mood === "sad").length,
    anxious: moods.filter((m) => m.mood === "anxious").length,
    angry: moods.filter((m) => m.mood === "angry").length,
    neutral: moods.filter((m) => m.mood === "neutral").length,
  }

  const recentEntries = moods.slice(0, 3).map((m) => ({
    date: m.date,
    mood: m.mood.charAt(0).toUpperCase() + m.mood.slice(1),
    entry: m.notes || "No notes",
  }))

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {loadingUser
            ? "Loading..."
            : `Welcome back, ${userData?.name || userData?.email || "User"}!`}
        </h1>
        {!loadingUser && userData?.role && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Role: {userData.role}</p>
        )}
        <p className="text-[hsl(var(--muted-foreground))]">
          {userData?.role === "therapist"
            ? "Here’s an overview of your practice today"
            : "Here's your mental wellness summary"}
        </p>
      </div>
      {userData?.role === "therapist" ? (
        <>
          {/* Therapist Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Upcoming Sessions", value: 3, color: "bg-indigo-100 dark:bg-indigo-900/30" },
              { label: "Pending Requests", value: 2, color: "bg-yellow-100 dark:bg-yellow-900/30" },
              { label: "Active Clients", value: 8, color: "bg-green-100 dark:bg-green-900/30" },
              { label: "New Messages", value: 1, color: "bg-blue-100 dark:bg-blue-900/30" },
            ].map((stat) => (
              <Card key={stat.label} className={`p-4 border-none ${stat.color}`}>
                <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Today’s Schedule</h2>
                  <Link href="/dashboard/sessions">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {[{ time: "10:00", client: "Alex Johnson", type: "Video" }, { time: "14:30", client: "Priya Singh", type: "In-Person" }].map((s, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{s.client}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{s.type} session</p>
                      </div>
                      <span className="text-sm font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-3 py-1 rounded">{s.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="p-6 border border-[hsl(var(--border))]">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/availability">
                    <Button className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white justify-start">Manage Availability</Button>
                  </Link>
                  <Link href="/dashboard/sessions">
                    <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">View Sessions</Button>
                  </Link>
                  <Link href="/dashboard/clients">
                    <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">View Clients</Button>
                  </Link>
                  <Link href="/dashboard/resources">
                    <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">Therapist Resources</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-[hsl(var(--border))]">
                <h3 className="font-bold mb-2">Practice Tip</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Confirm tomorrow’s schedule before end of day to reduce no-shows.</p>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Patient Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Happy", value: moodStats.happy, color: "bg-yellow-100 dark:bg-yellow-900/30" },
              { label: "Sad", value: moodStats.sad, color: "bg-blue-100 dark:bg-blue-900/30" },
              { label: "Anxious", value: moodStats.anxious, color: "bg-purple-100 dark:bg-purple-900/30" },
              { label: "Angry", value: moodStats.angry, color: "bg-red-100 dark:bg-red-900/30" },
              { label: "Neutral", value: moodStats.neutral, color: "bg-gray-100 dark:bg-gray-900/30" },
            ].map((stat) => (
              <Card key={stat.label} className={`p-4 border-none ${stat.color}`}>
                <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Moods */}
            <div className="lg:col-span-2">
              <Card className="p-6 border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Recent Mood Entries</h2>
                  <Link href="/dashboard/mood">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {loadingMoods && (
                    <div className="p-4 rounded-lg bg-[hsl(var(--muted))]">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading recent moods...</p>
                    </div>
                  )}
                  {!loadingMoods && recentEntries.length === 0 && (
                    <div className="p-4 rounded-lg bg-[hsl(var(--muted))]">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">No mood entries yet.</p>
                    </div>
                  )}
                  {!loadingMoods && recentEntries.map((entry, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[hsl(var(--muted))] hover:bg-opacity-80 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{entry.date}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">{entry.entry}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">{entry.mood}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card className="p-6 border border-[hsl(var(--border))]">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/mood">
                    <Button className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white justify-start">Log Mood</Button>
                  </Link>
                  <Link href="/dashboard/journal">
                    <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">Write Journal</Button>
                  </Link>
                  <Link href="/dashboard/appointments">
                    <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">Book Appointment</Button>
                  </Link>
                  <Link href="/dashboard/resources">
                    <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">Browse Resources</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-[hsl(var(--border))]">
                <h3 className="font-bold mb-2">Wellness Tip</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Take a 5-minute breathing break every hour. It can significantly reduce stress and improve focus.</p>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
