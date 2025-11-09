"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "1,234", change: "+12%", color: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Active Therapists", value: "89", change: "+5%", color: "bg-green-100 dark:bg-green-900/30" },
    { label: "Pending Approvals", value: "23", change: "-3%", color: "bg-yellow-100 dark:bg-yellow-900/30" },
    { label: "Total Sessions", value: "4,567", change: "+28%", color: "bg-purple-100 dark:bg-purple-900/30" },
  ]

  const recentActivity = [
    { id: 1, user: "John Doe", action: "Registered as Patient", time: "2 hours ago", type: "signup" },
    { id: 2, user: "Dr. Jane Smith", action: "Applied as Therapist", time: "4 hours ago", type: "therapist" },
    { id: 3, user: "Sarah Johnson", action: "Completed Appointment", time: "6 hours ago", type: "appointment" },
    { id: 4, user: "Mike Wilson", action: "Updated Profile", time: "8 hours ago", type: "profile" },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`p-6 border-none ${stat.color}`}>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{stat.label}</p>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-bold">{stat.value}</p>
              <span className="text-xs font-semibold text-green-600">{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6 border border-[hsl(var(--border))]">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
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
