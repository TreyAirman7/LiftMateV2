"use client"

import { useState } from "react"
import { Target, Plus, Check, Dumbbell, Weight, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function GoalsTab() {
  const [goals, setGoals] = useState([
    {
      id: "1",
      type: "exercise",
      exercise: "Bench Press",
      target: 225,
      current: 185,
      unit: "lbs",
      completed: false,
    },
    {
      id: "2",
      type: "weight",
      target: 170,
      current: 175,
      unit: "lbs",
      completed: false,
    },
    {
      id: "3",
      type: "visits",
      target: 4,
      current: 3,
      timeframe: "weekly",
      completed: false,
    },
    {
      id: "4",
      type: "exercise",
      exercise: "Squat",
      target: 315,
      current: 315,
      unit: "lbs",
      completed: true,
    },
  ])

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {/* Goals Header */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <Target className="h-10 w-10" />
        <h2 className="text-2xl font-bold">Goals</h2>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Add Goal Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <RadioGroup defaultValue="exercise" className="flex space-x-2">
                  <div className="flex items-center space-x-2 border rounded-md p-2 [&:has(:checked)]:bg-muted">
                    <RadioGroupItem id="goal-exercise" value="exercise" />
                    <Label htmlFor="goal-exercise" className="flex items-center">
                      <Dumbbell className="h-4 w-4 mr-1" />
                      Exercise
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-2 [&:has(:checked)]:bg-muted">
                    <RadioGroupItem id="goal-weight" value="weight" />
                    <Label htmlFor="goal-weight" className="flex items-center">
                      <Weight className="h-4 w-4 mr-1" />
                      Weight
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-2 [&:has(:checked)]:bg-muted">
                    <RadioGroupItem id="goal-visits" value="visits" />
                    <Label htmlFor="goal-visits" className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Visits
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise">Exercise</Label>
                <Select>
                  <SelectTrigger id="exercise">
                    <SelectValue placeholder="Select Exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bench-press">Bench Press</SelectItem>
                    <SelectItem value="squat">Squat</SelectItem>
                    <SelectItem value="deadlift">Deadlift</SelectItem>
                    <SelectItem value="overhead-press">Overhead Press</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Value</Label>
                <Input id="target" type="number" placeholder="e.g. 225" />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">Save Goal</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Active Goals */}
        <div className="space-y-2">
          <h3 className="font-medium">Active Goals</h3>

          {goals
            .filter((goal) => !goal.completed)
            .map((goal) => (
              <Card key={goal.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      {goal.type === "exercise" && (
                        <>
                          <h4 className="font-medium">{goal.exercise}</h4>
                          <p className="text-sm text-muted-foreground">Exercise Goal</p>
                        </>
                      )}
                      {goal.type === "weight" && (
                        <>
                          <h4 className="font-medium">Body Weight</h4>
                          <p className="text-sm text-muted-foreground">Weight Goal</p>
                        </>
                      )}
                      {goal.type === "visits" && (
                        <>
                          <h4 className="font-medium">Gym Visits</h4>
                          <p className="text-sm text-muted-foreground">
                            {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)} Goal
                          </p>
                        </>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {goal.current} / {goal.target} {goal.unit || ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((goal.current / goal.target) * 100)}% Complete
                      </p>
                    </div>
                  </div>

                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Completed Goals */}
        <div className="space-y-2">
          <h3 className="font-medium">Completed Goals</h3>

          {goals
            .filter((goal) => goal.completed)
            .map((goal) => (
              <Card key={goal.id} className="overflow-hidden border-primary">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      {goal.type === "exercise" && (
                        <>
                          <h4 className="font-medium">{goal.exercise}</h4>
                          <p className="text-sm text-muted-foreground">Exercise Goal</p>
                        </>
                      )}
                      {goal.type === "weight" && (
                        <>
                          <h4 className="font-medium">Body Weight</h4>
                          <p className="text-sm text-muted-foreground">Weight Goal</p>
                        </>
                      )}
                      {goal.type === "visits" && (
                        <>
                          <h4 className="font-medium">Gym Visits</h4>
                          <p className="text-sm text-muted-foreground">
                            {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)} Goal
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center">
                      <p className="font-bold text-primary mr-2">
                        {goal.target} {goal.unit || ""}
                      </p>
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}

