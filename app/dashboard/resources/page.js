"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const resources = [
    {
      id: 1,
      title: "Understanding Anxiety Disorders",
      category: "anxiety",
      type: "article",
      description: "Learn about different types of anxiety disorders and evidence-based treatments.",
      author: "Dr. Sarah Mitchell",
      readTime: "8 min read",
    },
    {
      id: 2,
      title: "Meditation for Beginners",
      category: "mindfulness",
      type: "video",
      description: "A guided introduction to meditation techniques for stress reduction.",
      author: "James Chen",
      readTime: "12 min video",
    },
    {
      id: 3,
      title: "Coping Strategies for Depression",
      category: "depression",
      type: "guide",
      description: "Practical techniques and strategies to manage depressive symptoms.",
      author: "Dr. Emma Williams",
      readTime: "15 min guide",
    },
    {
      id: 4,
      title: "Sleep Hygiene 101",
      category: "sleep",
      type: "article",
      description: "Improve your sleep quality with proven sleep hygiene practices.",
      author: "Dr. Michael Brown",
      readTime: "6 min read",
    },
    {
      id: 5,
      title: "Breathing Exercises for Stress Relief",
      category: "stress",
      type: "video",
      description: "Learn five powerful breathing techniques to calm your nervous system.",
      author: "Yoga Instructor Lisa",
      readTime: "10 min video",
    },
    {
      id: 6,
      title: "Cognitive Behavioral Therapy (CBT) Basics",
      category: "therapy",
      type: "guide",
      description: "Understand how CBT works and how it can help improve mental health.",
      author: "Dr. Robert Taylor",
      readTime: "14 min guide",
    },
  ]

  const categories = [
    { value: "all", label: "All Resources" },
    { value: "anxiety", label: "Anxiety" },
    { value: "depression", label: "Depression" },
    { value: "mindfulness", label: "Mindfulness" },
    { value: "stress", label: "Stress Management" },
    { value: "sleep", label: "Sleep" },
    { value: "therapy", label: "Therapy" },
  ]

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getTypeColor = (type) => {
    const colors = {
      article: "bg-blue-100 dark:bg-blue-900/30 text-blue-700",
      video: "bg-purple-100 dark:bg-purple-900/30 text-purple-700",
      guide: "bg-green-100 dark:bg-green-900/30 text-green-700",
    }
    return colors[type] || colors.article
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Mental Health Resources</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">
          Access articles, guides, and videos for your wellness
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <Input
          type="search"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white dark:bg-slate-800 border-[hsl(var(--border))]"
        />

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                selectedCategory === category.value
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card
            key={resource.id}
            className="p-6 border border-[hsl(var(--border))] hover:shadow-lg transition flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getTypeColor(resource.type)}`}>
                {resource.type}
              </span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{resource.readTime}</span>
            </div>

            <h3 className="text-lg font-bold mb-2 line-clamp-2">{resource.title}</h3>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4 line-clamp-3 flex-1">
              {resource.description}
            </p>

            <div className="flex justify-between items-center mb-4 text-xs text-[hsl(var(--muted-foreground))]">
              <span>By {resource.author}</span>
            </div>

            <Button className="w-full bg-[hsl(var(--primary))] hover:bg-blue-600 text-white">Read More</Button>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[hsl(var(--muted-foreground))]">No resources found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
