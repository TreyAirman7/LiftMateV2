"use client"

import { useState, useEffect } from "react"
import { Dumbbell, BarChart2, TrendingUp, Clipboard, Clock, Target, Image } from "lucide-react"
import { useTheme } from "next-themes"
import WorkoutTab from "@/components/workout-tab"
import StatsTab from "@/components/stats-tab"
import ProgressTab from "@/components/progress-tab"
import ExercisesTab from "@/components/exercises-tab"
import HistoryTab from "@/components/history-tab"
import GoalsTab from "@/components/goals-tab"
import PicsTab from "@/components/pics-tab"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeSelector } from "@/components/theme-selector"

export default function LiftMatePage() {
  const [activeTab, setActiveTab] = useState("workout")
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const [userName, setUserName] = useState("Trey")

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col h-screen">
      {/* App Header */}
      <header className="flex items-center justify-between p-4 app-header text-white">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">LiftMate</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSelector />
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-white">
            <span className="sr-only">Profile</span>
            <div className="h-6 w-6 rounded-sm bg-white"></div>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === "workout" && <WorkoutTab userName={userName} greeting={getGreeting()} />}
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "progress" && <ProgressTab />}
        {activeTab === "exercises" && <ExercisesTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "goals" && <GoalsTab />}
        {activeTab === "pics" && <PicsTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-7 border-t border-border bg-background">
        {[
          { id: "workout", icon: <Dumbbell className="h-6 w-6" />, label: "Workout" },
          { id: "stats", icon: <BarChart2 className="h-6 w-6" />, label: "Stats" },
          { id: "progress", icon: <TrendingUp className="h-6 w-6" />, label: "Progress" },
          { id: "exercises", icon: <Clipboard className="h-6 w-6" />, label: "Exercises" },
          { id: "history", icon: <Clock className="h-6 w-6" />, label: "History" },
          { id: "goals", icon: <Target className="h-6 w-6" />, label: "Goals" },
          { id: "pics", icon: <Image className="h-6 w-6" />, label: "Pics" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-2 relative transition-colors ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === tab.id && <div className="absolute top-0 w-10 h-1 bg-primary rounded-full"></div>}
            {tab.icon}
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

