"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar, ChevronRight, Search, BarChart2, Dumbbell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { CompletedWorkout } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"

export default function HistoryTab() {
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [selectedWorkout, setSelectedWorkout] = useState<CompletedWorkout | null>(null)

  // Load workouts on mount
  useEffect(() => {
    const loadWorkouts = () => {
      try {
        // Initialize storage if needed
        DataManager.initializeStorage()

        // Get workouts from localStorage
        const workouts = DataManager.getWorkouts()

        // Sort by date (newest first)
        workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setWorkouts(workouts)
      } catch (error) {
        console.error("Failed to load workouts:", error)
        setWorkouts([])
      }
    }

    loadWorkouts()
  }, [])

  // Filter workouts based on search and time filter
  const filteredWorkouts = workouts.filter((workout) => {
    // Search filter
    const matchesSearch =
      workout.templateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.exercises.some((ex) => ex.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()))

    // Time filter
    let matchesTime = true
    const workoutDate = new Date(workout.date)
    const now = new Date()

    if (timeFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      matchesTime = workoutDate >= weekAgo
    } else if (timeFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(now.getMonth() - 1)
      matchesTime = workoutDate >= monthAgo
    } else if (timeFilter === "3months") {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      matchesTime = workoutDate >= threeMonthsAgo
    }

    return matchesSearch && matchesTime
  })

  // Group workouts by week
  const groupedWorkouts: { [key: string]: CompletedWorkout[] } = {}

  filteredWorkouts.forEach((workout) => {
    const date = new Date(workout.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)

    const weekKey = weekStart.toISOString().split("T")[0]

    if (!groupedWorkouts[weekKey]) {
      groupedWorkouts[weekKey] = []
    }

    groupedWorkouts[weekKey].push(workout)
  })

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format week range
  const formatWeekRange = (weekKey: string): string => {
    const weekStart = new Date(weekKey)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    return `${formatDate(weekStart.toISOString())} - ${formatDate(weekEnd.toISOString())}`
  }

  // Format duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate total volume for a workout
  const calculateTotalVolume = (workout: CompletedWorkout): number => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((exerciseTotal, set) => {
          return exerciseTotal + set.weight * set.reps
        }, 0)
      )
    }, 0)
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {/* History Header */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <Clock className="h-10 w-10" />
        <h2 className="text-2xl font-bold">Workout History</h2>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Search and Filter */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Workout History List */}
        <div className="space-y-6">
          {Object.keys(groupedWorkouts).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No workouts found</div>
          )}

          {Object.keys(groupedWorkouts).map((weekKey) => (
            <div key={weekKey} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">{formatWeekRange(weekKey)}</h3>
              </div>

              {groupedWorkouts[weekKey].map((workout) => (
                <Dialog key={workout.id}>
                  <DialogTrigger asChild>
                    <Card className="overflow-hidden cursor-pointer hover:border-teal-600 transition-colors">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{workout.templateName || "Custom Workout"}</h3>
                              <p className="text-sm text-muted-foreground">{formatDate(workout.date)}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="flex justify-between mt-3">
                            <div className="flex flex-col items-center">
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="font-medium">{formatDuration(workout.duration)}</p>
                            </div>

                            <div className="flex flex-col items-center">
                              <p className="text-xs text-muted-foreground">Exercises</p>
                              <p className="font-medium">{workout.exercises.length}</p>
                            </div>

                            <div className="flex flex-col items-center">
                              <p className="text-xs text-muted-foreground">Volume</p>
                              <p className="font-medium">{calculateTotalVolume(workout).toLocaleString()} lbs</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>

                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Workout Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                      {/* Workout Overview */}
                      <div className="space-y-2">
                        <h3 className="font-medium">{workout.templateName || "Custom Workout"}</h3>
                        <p className="text-sm">{formatDate(workout.date)}</p>

                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div className="flex flex-col items-center">
                            <Clock className="h-5 w-5 mb-1 text-primary" />
                            <span className="text-lg font-bold">{formatDuration(workout.duration)}</span>
                            <span className="text-xs text-muted-foreground">Duration</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <BarChart2 className="h-5 w-5 mb-1 text-primary" />
                            <span className="text-lg font-bold">{calculateTotalVolume(workout).toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">Volume (lbs)</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <Dumbbell className="h-5 w-5 mb-1 text-primary" />
                            <span className="text-lg font-bold">{workout.exercises.length}</span>
                            <span className="text-xs text-muted-foreground">Exercises</span>
                          </div>
                        </div>
                      </div>

                      {/* Exercise Details */}
                      <div className="space-y-4 pt-2">
                        {workout.exercises.map((exercise, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">{exercise.exerciseName}</h4>

                              <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                                  <div className="col-span-2 text-center">Set</div>
                                  <div className="col-span-4 text-center">Weight</div>
                                  <div className="col-span-3 text-center">Reps</div>
                                  <div className="col-span-3 text-center">Volume</div>
                                </div>

                                {exercise.sets.map((set, setIndex) => (
                                  <div
                                    key={setIndex}
                                    className="grid grid-cols-12 gap-2 items-center py-1 border-b border-border last:border-0"
                                  >
                                    <div className="col-span-2 text-center">
                                      <Badge variant="outline">{setIndex + 1}</Badge>
                                    </div>
                                    <div className="col-span-4 text-center">{set.weight} lbs</div>
                                    <div className="col-span-3 text-center">{set.reps}</div>
                                    <div className="col-span-3 text-center font-medium">{set.weight * set.reps}</div>
                                  </div>
                                ))}

                                <div className="flex justify-between pt-2 font-medium">
                                  <span>Total</span>
                                  <span>
                                    {exercise.sets
                                      .reduce((total, set) => total + set.weight * set.reps, 0)
                                      .toLocaleString()}{" "}
                                    lbs
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ))}

          {Object.keys(groupedWorkouts).length > 0 && (
            <Button variant="outline" className="w-full">
              Load More
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

