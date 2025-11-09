"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function MoodChart({ moods }) {
  // Process data for chart
  const chartData = moods
    .reverse()
    .slice(0, 7)
    .map((mood) => ({
      date: mood.date.split("-")[2],
      [mood.mood]: mood.intensity,
      fullData: mood,
    }))

  // Combine moods for each date
  const processedData = []
  const dateMap = {}

  moods.forEach((mood) => {
    const date = mood.date.split("-")[2]
    if (!dateMap[date]) {
      dateMap[date] = { date }
    }
    dateMap[date][mood.mood] = mood.intensity
  })

  Object.values(dateMap).forEach((item) => {
    processedData.push(item)
  })

  const colors = {
    happy: "#fbbf24",
    sad: "#60a5fa",
    anxious: "#c084fc",
    angry: "#f87171",
    neutral: "#d1d5db",
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={processedData.slice(-7)}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
        {Object.keys(colors).map((mood) => (
          <Bar key={mood} dataKey={mood} fill={colors[mood]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
