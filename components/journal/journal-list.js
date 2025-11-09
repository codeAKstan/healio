"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function JournalList({ entries, onEdit, onDelete }) {
  const moodEmojis = {
    happy: "😊",
    sad: "😢",
    anxious: "😰",
    angry: "😠",
    neutral: "😐",
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Entries</h2>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">{entries.length} entries</span>
      </div>

      {entries.length === 0 ? (
        <Card className="p-12 text-center border border-[hsl(var(--border))]">
          <p className="text-[hsl(var(--muted-foreground))] mb-4">No entries yet. Start journaling today!</p>
        </Card>
      ) : (
        entries.map((entry) => (
          <Card key={entry.id} className="p-6 border border-[hsl(var(--border))] hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-3xl">{moodEmojis[entry.mood]}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{entry.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{entry.date}</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-xs font-semibold capitalize bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] whitespace-nowrap">
                {entry.mood}
              </span>
            </div>

            <p className="text-[hsl(var(--foreground))] mb-4 line-clamp-3">{entry.content}</p>

            <div className="flex gap-2">
              <Button onClick={() => onEdit(entry)} variant="outline" size="sm" className="border-[hsl(var(--border))]">
                Edit
              </Button>
              <Button
                onClick={() => onDelete(entry.id)}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
