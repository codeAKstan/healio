"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [userData, setUserData] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

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

  const moodStats = {
    happy: 15,
    sad: 3,
    anxious: 8,
    angry: 2,
    neutral: 7,
  }

  const recentEntries = [
    { date: "Today", mood: "Happy", entry: "Had a great day at work!" },
    { date: "Yesterday", mood: "Neutral", entry: "Regular day, nothing special" },
    { date: "2 days ago", mood: "Anxious", entry: "Worried about upcoming meeting" },
  ]

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
        <p className="text-[hsl(var(--muted-foreground))]">Here's your mental wellness summary</p>
      </div>

      {/* Stats Cards */}
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
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentEntries.map((entry, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[hsl(var(--muted))] hover:bg-opacity-80 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{entry.date}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{entry.entry}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                      {entry.mood}
                    </span>
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
                <Button className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white justify-start">
                  Log Mood
                </Button>
              </Link>
              <Link href="/dashboard/journal">
                <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">
                  Write Journal
                </Button>
              </Link>
              <Link href="/dashboard/appointments">
                <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">
                  Book Appointment
                </Button>
              </Link>
              <Link href="/dashboard/resources">
                <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">
                  Browse Resources
                </Button>
              </Link>
            </div>
          </Card>

          {/* Wellness Tip */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-[hsl(var(--border))]">
            <h3 className="font-bold mb-2">Wellness Tip</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Take a 5-minute breathing break every hour. It can significantly reduce stress and improve focus.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
