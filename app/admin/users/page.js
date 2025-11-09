"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "patient",
      status: "active",
      joinDate: "2024-03-15",
    },
    {
      id: 2,
      name: "Dr. Michael Brown",
      email: "michael@example.com",
      role: "therapist",
      status: "approved",
      joinDate: "2024-02-10",
    },
    { id: 3, name: "John Doe", email: "john@example.com", role: "patient", status: "active", joinDate: "2024-01-20" },
    {
      id: 4,
      name: "Dr. Emma Williams",
      email: "emma@example.com",
      role: "therapist",
      status: "pending",
      joinDate: "2025-01-08",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleApproveTherapist = (userId) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "approved" } : u)))
  }

  const handleDeactivateUser = (userId) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "inactive" } : u)))
  }

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 dark:bg-green-900/30 text-green-700",
      approved: "bg-green-100 dark:bg-green-900/30 text-green-700",
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700",
      inactive: "bg-gray-100 dark:bg-gray-900/30 text-gray-700",
    }
    return colors[status] || colors.active
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">User Management</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          type="search"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]"
        >
          <option value="all">All Roles</option>
          <option value="patient">Patients</option>
          <option value="therapist">Therapists</option>
        </select>
      </div>

      {/* Users Table */}
      <Card className="p-6 border border-[hsl(var(--border))] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Email</th>
              <th className="text-left py-3 px-4 font-semibold">Role</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Join Date</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                <td className="py-3 px-4 font-semibold">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4 capitalize">{user.role}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{user.joinDate}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {user.role === "therapist" && user.status === "pending" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveTherapist(user.id)}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 bg-transparent"
                      onClick={() => handleDeactivateUser(user.id)}
                    >
                      Deactivate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
