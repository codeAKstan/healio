"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AuthCard from "@/components/auth-card"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    role: "patient",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      console.log("Registration attempt:", formData)
      setTimeout(() => {
        alert("Registration would process with your backend")
        setLoading(false)
      }, 1000)
    } catch (err) {
      setError("Registration failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 py-12">
      <AuthCard>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">Join Healio and start your wellness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[hsl(var(--foreground))]">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-[hsl(var(--foreground))]">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                name="age"
                placeholder="25"
                value={formData.age}
                onChange={handleChange}
                required
                className="bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[hsl(var(--foreground))]">Gender</Label>
              <Select value={formData.gender} onValueChange={handleGenderChange}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-[hsl(var(--border))]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--foreground))]">Account Type</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-[hsl(var(--border))]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[hsl(var(--foreground))]">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white py-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-[hsl(var(--muted-foreground))]">
            Already have an account?{" "}
            <Link href="/login" className="text-[hsl(var(--primary))] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </AuthCard>
    </div>
  )
}
