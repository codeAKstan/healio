"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import MoodChart from "@/components/mood/mood-chart"

export default function MoodTrackerPage() {
  const [moods, setMoods] = useState([
    { date: "2025-01-08", mood: "happy", intensity: 8, notes: "Had a great day!" },
    { date: "2025-01-07", mood: "anxious", intensity: 6, notes: "Worried about work" },
    { date: "2025-01-06", mood: "neutral", intensity: 5, notes: "Regular day" },
    { date: "2025-01-05", mood: "happy", intensity: 9, notes: "Vacation day!" },
    { date: "2025-01-04", mood: "sad", intensity: 4, notes: "Missing someone" },
  ])

  const [selectedMood, setSelectedMood] = useState(null)
  const [intensity, setIntensity] = useState(5)
  const [notes, setNotes] = useState("")

  const moodOptions = [
    { value: "happy", label: "Happy", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" },
    { value: "sad", label: "Sad", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
    { value: "anxious", label: "Anxious", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
    { value: "angry", label: "Angry", color: "bg-red-100 dark:bg-red-900/30 text-red-600" },
    { value: "neutral", label: "Neutral", color: "bg-gray-100 dark:bg-gray-900/30 text-gray-600" },
  ]

  const handleLogMood = () => {
    if (!selectedMood) return

    const newMood = {
      date: new Date().toISOString().split("T")[0],
      mood: selectedMood,
      intensity,
      notes,
    }

    setMoods([newMood, ...moods])
    setSelectedMood(null)
    setIntensity(5)
    setNotes("")
    alert("Mood logged successfully!")
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Mood Tracker</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Track your daily emotions and understand patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Mood Section */}
        <div className="lg:col-span-1">
          <Card className="p-6 border border-[hsl(var(--border))] sticky top-24">
            <h2 className="text-xl font-bold mb-4">How are you feeling?</h2>

            {/* Mood Selection */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-3 rounded-lg font-semibold transition ${
                    selectedMood === mood.value
                      ? `${mood.color} ring-2 ring-[hsl(var(--primary))]`
                      : `${mood.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {mood.label}
                </button>
              ))}
            </div>

            {/* Intensity Slider */}
            <div className="mb-6">
              <Label className="text-[hsl(var(--foreground))] mb-2 block">Intensity: {intensity}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <Label className="text-[hsl(var(--foreground))] mb-2 block">Notes (optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                className="w-full p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] resize-none"
                rows="4"
              />
            </div>

            <Button
              onClick={handleLogMood}
              disabled={!selectedMood}
              className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white disabled:opacity-50"
            >
              Log Mood
            </Button>
          </Card>
        </div>

        {/* Chart and History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <Card className="p-6 border border-[hsl(var(--border))]">
            <h2 className="text-xl font-bold mb-4">Your Mood Trends</h2>
            <MoodChart moods={moods} />
          </Card>

          {/* Recent Moods */}
          <Card className="p-6 border border-[hsl(var(--border))]">
            <h2 className="text-xl font-bold mb-4">Recent Entries</h2>
            <div className="space-y-3">
              {moods.slice(0, 5).map((mood, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[hsl(var(--muted))] flex items-start gap-4">
                  <div className="text-3xl">
                    {
                      {
                        happy: "😊",
                        sad: "😢",
                        anxious: "😰",
                        angry: "😠",
                        neutral: "😐",
                      }[mood.mood]
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold capitalize">{mood.mood}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{mood.date}</p>
                      </div>
                      <span className="text-sm font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-3 py-1 rounded">
                        {mood.intensity}/10
                      </span>
                    </div>
                    {mood.notes && <p className="text-sm mt-2 text-[hsl(var(--muted-foreground))]">{mood.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
