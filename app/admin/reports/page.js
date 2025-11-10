"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts"

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState({
    usersByDay: [],
    sessionsByDay: [],
    statusDistribution: { pending: 0, confirmed: 0, cancelled: 0 },
    cancellationsRate: 0,
    topTherapists: [],
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/reports?days=30")
        if (!res.ok) throw new Error(`Failed to load reports (${res.status})`)
        const json = await res.json()
        setData(json)
        setError("")
      } catch (e) {
        setError(e.message || "Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const chartConfigUsers = useMemo(
    () => ({
      patients: { label: "Patients", color: "hsl(210 98% 62%)" },
      therapists: { label: "Therapists", color: "hsl(11 84% 62%)" },
    }),
    []
  )

  const chartConfigSessions = useMemo(
    () => ({ total: { label: "Sessions", color: "hsl(142 71% 45%)" } }),
    []
  )

  if (loading) return <div className="p-6">Loading reports…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 grid gap-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Users (30 days)</CardTitle>
            <CardDescription>Daily registrations split by role.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigUsers} className="h-[280px]">
              <LineChart data={data.usersByDay} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="patients" stroke="var(--color-patients)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="therapists" stroke="var(--color-therapists)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions Scheduled (30 days)</CardTitle>
            <CardDescription>Appointments scheduled per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigSessions} className="h-[280px]">
              <BarChart data={data.sessionsByDay} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Bar dataKey="total" fill="var(--color-total)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Counts by appointment status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-semibold">{data.statusDistribution.pending}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Confirmed</div>
                <div className="text-2xl font-semibold">{data.statusDistribution.confirmed}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Cancelled</div>
                <div className="text-2xl font-semibold">{data.statusDistribution.cancelled}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Cancellation rate: {(data.cancellationsRate * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Therapists</CardTitle>
            <CardDescription>By confirmed sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <tr>
                  <th className="text-left py-2 px-2">Therapist</th>
                  <th className="text-right py-2 px-2">Confirmed Sessions</th>
                </tr>
              </TableHeader>
              <TableBody>
                {data.topTherapists.length === 0 ? (
                  <tr>
                    <td className="py-3 px-2" colSpan={2}>No data</td>
                  </tr>
                ) : (
                  data.topTherapists.map((t) => (
                    <tr key={t.therapistId} className="border-b">
                      <td className="py-3 px-2">{t.name}</td>
                      <td className="py-3 px-2 text-right">{t.count}</td>
                    </tr>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}