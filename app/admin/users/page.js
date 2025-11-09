"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  async function fetchUsers() {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/admin/users")
      if (!res.ok) throw new Error("Failed to load users")
      const data = await res.json()
      const list = (data.users || []).map((u) => ({
        id: u.id,
        name: u.name || u.email || "Unnamed",
        email: u.email,
        role: u.role,
        status: u.status || (u.role === "therapist" ? "pending" : "active"),
        createdAt: u.createdAt,
      }))
      setUsers(list)
    } catch (e) {
      console.error(e)
      setError("Could not load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleApproveTherapist = async (userId) => {
    try {
      const res = await fetch(`/api/admin/therapists/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      if (!res.ok) throw new Error("Failed to approve")
      const updated = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: updated.therapistStatus } : u)))
    } catch (e) {
      alert("Unable to approve therapist")
    }
  }

  // Deactivation not implemented in data model; action removed.

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
        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading users...</p>
        ) : (
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-[hsl(var(--muted-foreground))]">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                <td className="py-3 px-4 font-semibold">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4 capitalize">{user.role}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">
                  {user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : "-"}
                </td>
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
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
