"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedTherapist, setSelectedTherapist] = useState(null)

  async function fetchTherapists() {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/admin/therapists")
      if (!res.ok) throw new Error("Failed to load therapists")
      const data = await res.json()
      const list = (data.therapists || []).map((t) => ({
        id: t.id,
        name: t.name || t.email || "Unnamed",
        email: t.email,
        status: t.therapistStatus || "pending",
        certificateUrl: t.certificateUrl || "",
        createdAt: t.createdAt,
        avatar: (t.name || t.email || "U")
          .split(/\s+/)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase())
          .join("") || "U",
      }))
      setTherapists(list)
    } catch (e) {
      console.error(e)
      setError("Could not load therapists")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTherapists()
  }, [])

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/admin/therapists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      if (!res.ok) throw new Error("Failed to approve")
      const updated = await res.json()
      setTherapists((prev) => prev.map((t) => (t.id === id ? { ...t, status: updated.therapistStatus } : t)))
      if (selectedTherapist?.id === id) {
        setSelectedTherapist((prev) => ({ ...prev, status: updated.therapistStatus }))
      }
    } catch (e) {
      alert("Unable to approve therapist")
    }
  }

  const handleReject = async (id) => {
    try {
      const res = await fetch(`/api/admin/therapists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })
      if (!res.ok) throw new Error("Failed to reject")
      const updated = await res.json()
      setTherapists((prev) => prev.map((t) => (t.id === id ? { ...t, status: updated.therapistStatus } : t)))
      if (selectedTherapist?.id === id) {
        setSelectedTherapist((prev) => ({ ...prev, status: updated.therapistStatus }))
      }
    } catch (e) {
      alert("Unable to reject therapist")
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      approved: "bg-green-100 dark:bg-green-900/30 text-green-700",
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700",
      rejected: "bg-red-100 dark:bg-red-900/30 text-red-700",
    }
    return colors[status] || colors.pending
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Therapist Management</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Manage and approve therapist applications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Therapist List */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <Card className="p-4 border border-[hsl(var(--border))]">
              <p className="text-sm text-red-600">{error}</p>
            </Card>
          )}
          {loading && (
            <Card className="p-4 border border-[hsl(var(--border))]">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading therapists...</p>
            </Card>
          )}
          {!loading && therapists.length === 0 && (
            <Card className="p-12 text-center border border-[hsl(var(--border))]">
              <p className="text-[hsl(var(--muted-foreground))]">No therapists found.</p>
            </Card>
          )}
          {!loading && therapists.map((therapist) => (
            <Card
              key={therapist.id}
              className="p-6 border border-[hsl(var(--border))] cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedTherapist(therapist)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {therapist.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold">{therapist.name}</h3>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(therapist.status)}`}
                    >
                      {therapist.status}
                    </span>
                  </div>
                  <div className="text-[hsl(var(--muted-foreground))] text-sm mb-2">
                    {therapist.email}
                  </div>
                  <div className="flex gap-6 text-sm">
                    {therapist.certificateUrl && (
                      <a
                        href={therapist.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[hsl(var(--primary))] hover:underline"
                      >
                        View Certificate
                      </a>
                    )}
                    <span>
                      Joined: {therapist.createdAt ? new Date(therapist.createdAt).toISOString().slice(0, 10) : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {therapist.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await handleApprove(therapist.id)
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await handleReject(therapist.id)
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Therapist Details */}
        {selectedTherapist && (
          <Card className="p-6 border border-[hsl(var(--border))] sticky top-6 h-fit">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedTherapist.avatar}
              </div>
              <h3 className="text-lg font-bold">{selectedTherapist.name}</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm">{selectedTherapist.email}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Status</p>
                <p className="font-semibold capitalize">{selectedTherapist.status}</p>
              </div>
              {selectedTherapist.certificateUrl && (
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Certificate</p>
                  <a
                    href={selectedTherapist.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--primary))] hover:underline"
                  >
                    View Certificate
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Joined</p>
                <p className="font-semibold">
                  {selectedTherapist.createdAt
                    ? new Date(selectedTherapist.createdAt).toISOString().slice(0, 10)
                    : "-"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full border-[hsl(var(--border))] bg-transparent">
                View Details
              </Button>
              <Button variant="outline" className="w-full border-[hsl(var(--border))] bg-transparent">
                Contact
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
