"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import JournalList from "@/components/journal/journal-list"

export default function JournalPage() {
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: "A Great Day",
      date: "2025-01-08",
      content:
        "Today was amazing! I had a successful meeting and my team appreciated my ideas. I feel more confident about my abilities.",
      mood: "happy",
    },
    {
      id: 2,
      title: "Reflecting on Changes",
      date: "2025-01-07",
      content:
        "I realized that small changes in my daily routine have made a big difference. Morning walks really help clear my mind.",
      mood: "neutral",
    },
    {
      id: 3,
      title: "Dealing with Stress",
      date: "2025-01-06",
      content:
        "Work has been stressful lately. I need to remember to take breaks and practice the breathing exercises my therapist taught me.",
      mood: "anxious",
    },
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("neutral")

  const prompts = [
    "What made me smile today?",
    "What am I grateful for today?",
    "What challenged me today, and how did I overcome it?",
    "What did I learn about myself today?",
    "How am I feeling right now, and why?",
    "What are my hopes for tomorrow?",
  ]

  const handleNewEntry = () => {
    setIsEditing(true)
    setEditingId(null)
    setTitle("")
    setContent("")
    setMood("neutral")
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content")
      return
    }

    if (editingId) {
      setEntries(
        entries.map((e) =>
          e.id === editingId ? { ...e, title, content, mood, date: new Date().toISOString().split("T")[0] } : e,
        ),
      )
    } else {
      const newEntry = {
        id: Math.max(...entries.map((e) => e.id), 0) + 1,
        title,
        content,
        mood,
        date: new Date().toISOString().split("T")[0],
      }
      setEntries([newEntry, ...entries])
    }

    setIsEditing(false)
    setTitle("")
    setContent("")
    setMood("neutral")
    alert("Journal entry saved!")
  }

  const handleDelete = (id) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id)
    setTitle(entry.title)
    setContent(entry.content)
    setMood(entry.mood)
    setIsEditing(true)
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Journal</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Express yourself and reflect on your thoughts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Entry / Prompts */}
        <div className="lg:col-span-1 space-y-4">
          {!isEditing ? (
            <>
              <Card className="p-6 border border-[hsl(var(--border))]">
                <Button
                  onClick={handleNewEntry}
                  className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white"
                >
                  Start New Entry
                </Button>
              </Card>

              {/* Writing Prompts */}
              <Card className="p-6 border border-[hsl(var(--border))]">
                <h3 className="font-bold mb-4">Writing Prompts</h3>
                <div className="space-y-2">
                  {prompts.map((prompt, idx) => (
                    <p
                      key={idx}
                      className="text-sm text-[hsl(var(--muted-foreground))] p-2 rounded bg-[hsl(var(--muted))] hover:bg-opacity-80 cursor-pointer transition"
                    >
                      {prompt}
                    </p>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6 border border-[hsl(var(--border))] sticky top-24">
              <h3 className="font-bold mb-4">{editingId ? "Edit Entry" : "New Entry"}</h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-[hsl(var(--foreground))]">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Entry title"
                    className="mt-1 bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
                  />
                </div>

                <div>
                  <Label className="text-[hsl(var(--foreground))]">Mood</Label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))]"
                  >
                    <option value="happy">Happy</option>
                    <option value="sad">Sad</option>
                    <option value="anxious">Anxious</option>
                    <option value="angry">Angry</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1 bg-[hsl(var(--primary))] hover:bg-blue-600 text-white">
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1 border-[hsl(var(--border))]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Entry Editor or List */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card className="p-6 border border-[hsl(var(--border))]">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full h-96 p-4 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))] resize-none font-[family-name:var(--font-sans)]"
              />
            </Card>
          ) : (
            <JournalList entries={entries} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  )
}
