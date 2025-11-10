"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const res = await fetch("/api/admin/stats")
        if (!res.ok) throw new Error("Failed to load stats")
        const data = await res.json()
        if (active) {
          setStats(data.stats || null)
          setRecentActivity(Array.isArray(data.recentActivity) ? data.recentActivity : [])
        }
      } catch (e) {
        console.error(e)
        if (active) setError("Could not load admin data")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <Card className="p-6 border-none bg-[hsl(var(--muted))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading stats...</p>
          </Card>
        ) : error ? (
          <Card className="p-6 border border-[hsl(var(--border))]">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        ) : (
          [
            { label: "Total Users", value: stats?.totalUsers ?? 0, color: "bg-blue-100 dark:bg-blue-900/30" },
            { label: "Active Therapists", value: stats?.activeTherapists ?? 0, color: "bg-green-100 dark:bg-green-900/30" },
            { label: "Pending Approvals", value: stats?.pendingApprovals ?? 0, color: "bg-yellow-100 dark:bg-yellow-900/30" },
            { label: "Total Sessions", value: stats?.totalSessions ?? 0, color: "bg-purple-100 dark:bg-purple-900/30" },
          ].map((stat) => (
            <Card key={stat.label} className={`p-6 border-none ${stat.color}`}>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{stat.label}</p>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-bold">{stat.value}</p>
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Updated</span>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6 border border-[hsl(var(--border))]">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {loading && (
                <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">Loading activity...</div>
              )}
              {!loading && recentActivity.length === 0 && (
                <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">No recent activity.</div>
              )}
              {!loading && recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 bg-[hsl(var(--muted))] rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{activity.user}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{activity.action}</p>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{activity.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 border border-[hsl(var(--border))] h-fit">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Button className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white justify-start">
              Approve Therapists
            </Button>
            <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">
              View Reports
            </Button>
            <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">
              Send Announcement
            </Button>
            <Button variant="outline" className="w-full justify-start border-[hsl(var(--border))] bg-transparent">
              System Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
