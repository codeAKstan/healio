"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)

  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) throw new Error("Failed to load user")
        const data = await res.json()
        if (active) {
          const joinDate = data.createdAt
            ? new Date(data.createdAt).toISOString().slice(0, 10)
            : "—"
          setProfileData({
            name: data.name || data.email || "User",
            email: data.email,
            age: data.age ?? "—",
            gender: data.gender || "—",
            role: data.role || "—",
            joinDate,
          })
          setEditData({
            name: data.name || "",
            email: data.email || "",
            age: data.age ?? "",
            gender: data.gender || "Other",
          })
        }
      } catch (e) {
        // If unauthenticated, dashboard layout/middleware should redirect
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setSaveMessage("")
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData?.name,
          email: undefined, // email not updatable here
          age: editData?.age,
          gender: editData?.gender,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save profile")
      }
      const updated = await res.json()
      setProfileData({
        name: updated.name || profileData?.name,
        email: updated.email || profileData?.email,
        age: updated.age ?? profileData?.age,
        gender: updated.gender || profileData?.gender,
        role: updated.role || profileData?.role,
        joinDate: updated.createdAt ? new Date(updated.createdAt).toISOString().slice(0,10) : profileData?.joinDate,
      })
      setIsEditing(false)
      setSaveMessage("Profile updated successfully.")
    } catch (e) {
      console.error(e)
      setSaveMessage(e.message || "Could not save profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Profile</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 border border-[hsl(var(--border))] text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {(profileData?.name || "U").slice(0, 2).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold mb-1">{profileData?.name || "Loading..."}</h2>
            {profileData?.role && (
              <p className="text-[hsl(var(--muted-foreground))] mb-4">{profileData.role}</p>
            )}
            {profileData?.joinDate && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Member since {profileData.joinDate}</p>
            )}
            <Button
              onClick={() => {
                setIsEditing(!isEditing)
                setEditData(profileData)
              }}
              className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-[hsl(var(--border))]">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>
            {saveMessage && (
              <div className="mb-4 p-3 rounded bg-[hsl(var(--muted))] text-sm">{saveMessage}</div>
            )}

            {!isEditing ? (
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: profileData?.name },
                  { label: "Email", value: profileData?.email },
                  { label: "Age", value: profileData?.age },
                  { label: "Gender", value: profileData?.gender },
                  { label: "Account Role", value: profileData?.role },
                  { label: "Member Since", value: profileData?.joinDate },
                ].map((field, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[hsl(var(--muted))] rounded-lg">
                    <span className="text-[hsl(var(--muted-foreground))]">{field.label}</span>
                    <span className="font-semibold">{field.value || "—"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-[hsl(var(--foreground))]">Full Name</Label>
                  <Input
                    value={editData?.name || ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="mt-1 bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
                  />
                </div>

                <div>
                  <Label className="text-[hsl(var(--foreground))]">Email</Label>
                  <Input
                    type="email"
                    value={editData?.email || ""}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="mt-1 bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[hsl(var(--foreground))]">Age</Label>
                    <Input
                      type="number"
                      value={editData?.age ?? ""}
                      onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                      className="mt-1 bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
                    />
                  </div>
                  <div>
                    <Label className="text-[hsl(var(--foreground))]">Gender</Label>
                    <select
                      value={editData?.gender || "Other"}
                      onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </Card>

          {/* Security Section */}
          <Card className="p-6 border border-[hsl(var(--border))]">
            <h2 className="text-xl font-bold mb-4">Security</h2>
            <Button variant="outline" className="w-full border-[hsl(var(--border))] bg-transparent">
              Change Password
            </Button>
          </Card>

          {/* Account Actions */}
          <Card className="p-6 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
            <h2 className="text-xl font-bold mb-4 text-red-600">Account Actions</h2>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 bg-transparent"
            >
              Delete Account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
