"use client"

import Sidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/header"
import { useState } from "react"

export default function DashboardClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[hsl(var(--background))]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}