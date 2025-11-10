"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [settings, setSettings] = useState({
    brandName: "",
    logoUrl: "",
    emailFromName: "",
    emailFromAddress: "",
    allowSelfRegistration: true,
    autoApproveTherapists: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/settings")
        if (!res.ok) throw new Error(`Failed to load settings (${res.status})`)
        const data = await res.json()
        setSettings({
          brandName: data.settings?.brandName || "",
          logoUrl: data.settings?.logoUrl || "",
          emailFromName: data.settings?.emailFromName || "",
          emailFromAddress: data.settings?.emailFromAddress || "",
          allowSelfRegistration: !!data.settings?.allowSelfRegistration,
          autoApproveTherapists: !!data.settings?.autoApproveTherapists,
        })
        setError("")
      } catch (e) {
        setError(e.message || "Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      toast({ title: "Settings saved", description: "Admin settings have been updated." })
    } catch (e) {
      toast({ title: "Save failed", description: e.message || "Could not save settings" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading settings…</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand</CardTitle>
          <CardDescription>Customize the brand identity shown across Admin.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input id="brandName" value={settings.brandName} onChange={(e) => setSettings((s) => ({ ...s, brandName: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" value={settings.logoUrl} onChange={(e) => setSettings((s) => ({ ...s, logoUrl: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>Configure where system emails originate from.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="emailFromName">From Name</Label>
            <Input id="emailFromName" value={settings.emailFromName} onChange={(e) => setSettings((s) => ({ ...s, emailFromName: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="emailFromAddress">From Address</Label>
            <Input id="emailFromAddress" value={settings.emailFromAddress} onChange={(e) => setSettings((s) => ({ ...s, emailFromAddress: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access & Approvals</CardTitle>
          <CardDescription>Control user registration and therapist approvals.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Allow Self‑Registration</div>
              <div className="text-sm text-muted-foreground">Enable users to register without invites.</div>
            </div>
            <Switch checked={settings.allowSelfRegistration} onCheckedChange={(v) => setSettings((s) => ({ ...s, allowSelfRegistration: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto‑Approve Therapists</div>
              <div className="text-sm text-muted-foreground">New therapist accounts are approved automatically.</div>
            </div>
            <Switch checked={settings.autoApproveTherapists} onCheckedChange={(v) => setSettings((s) => ({ ...s, autoApproveTherapists: v }))} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}