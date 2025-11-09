"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState([
    {
      id: 1,
      name: "Dr. Sarah Mitchell",
      specialization: "Anxiety & Stress",
      licenseNumber: "LIC-2024-001",
      status: "approved",
      patients: 12,
      avatar: "SM",
    },
    {
      id: 2,
      name: "Dr. Michael Brown",
      specialization: "Depression & Trauma",
      licenseNumber: "LIC-2024-002",
      status: "approved",
      patients: 8,
      avatar: "MB",
    },
    {
      id: 3,
      name: "Dr. Emma Williams",
      specialization: "Life Transitions",
      licenseNumber: "LIC-2025-003",
      status: "pending",
      patients: 0,
      avatar: "EW",
    },
  ])

  const [selectedTherapist, setSelectedTherapist] = useState(null)

  const handleApprove = (id) => {
    setTherapists(therapists.map((t) => (t.id === id ? { ...t, status: "approved" } : t)))
  }

  const handleReject = (id) => {
    setTherapists(therapists.filter((t) => t.id !== id))
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
          {therapists.map((therapist) => (
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
                  <p className="text-[hsl(var(--muted-foreground))] text-sm mb-2">{therapist.specialization}</p>
                  <div className="flex gap-6 text-sm">
                    <span>License: {therapist.licenseNumber}</span>
                    <span>{therapist.patients} patients</span>
                  </div>
                </div>
              </div>

              {therapist.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApprove(therapist.id)
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReject(therapist.id)
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
              <p className="text-[hsl(var(--muted-foreground))] text-sm">{selectedTherapist.specialization}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">License Number</p>
                <p className="font-semibold">{selectedTherapist.licenseNumber}</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Status</p>
                <p className="font-semibold capitalize">{selectedTherapist.status}</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Active Patients</p>
                <p className="font-semibold">{selectedTherapist.patients}</p>
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
