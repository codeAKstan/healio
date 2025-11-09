"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthCard from "@/components/auth-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [pendingOpen, setPendingOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState("pending")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.code === "THERAPIST_PENDING") {
          setPendingStatus(data.therapistStatus || "pending")
          setPendingOpen(true)
          setLoading(false)
          return
        }
        throw new Error(data.error || "Login failed")
      }
      setSuccess("Login successful")
      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (err) {
      setError("Login failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <AuthCard>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">Sign in to your Healio account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[hsl(var(--foreground))]">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[hsl(var(--foreground))]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white py-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-px bg-[hsl(var(--border))]"></div>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">or</span>
          <div className="flex-1 h-px bg-[hsl(var(--border))]"></div>
        </div>

        <div className="mt-6 space-y-3 text-center text-sm">
          <Link href="#" className="block text-[hsl(var(--primary))] hover:underline">
            Forgot password?
          </Link>
          <p className="text-[hsl(var(--muted-foreground))]">
            Don't have an account?{" "}
            <Link href="/register" className="text-[hsl(var(--primary))] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </AuthCard>

      {/* Pending Approval Modal */}
      <Dialog open={pendingOpen} onOpenChange={setPendingOpen}>
        <DialogContent className="bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle>Account Pending Approval</DialogTitle>
            <DialogDescription>
              Your therapist account isn't approved yet by the admin.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            Current status: <span className="font-semibold capitalize">{pendingStatus}</span>
          </div>
          <DialogFooter>
            <Button onClick={() => setPendingOpen(false)} className="bg-[hsl(var(--primary))] text-white">
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
