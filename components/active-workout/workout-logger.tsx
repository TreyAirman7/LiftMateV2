"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, Clock, Trophy, FastForward } from "lucide-react"
import { useThemeContext } from "@/components/theme-provider"
import { showSuccessToast, showErrorToast } from "@/lib/toast"
import type { WorkoutTemplate, WorkoutSet } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"

interface WorkoutLoggerProps {
  template: WorkoutTemplate
  onComplete: (workout: any) => void
  onCancel: () => void
}

export default function WorkoutLogger({ template, onComplete, onCancel }: WorkoutLoggerProps) {
  const { themeColor } = useThemeContext()
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<string, WorkoutSet[]>>({})
  const [isResting, setIsResting] = useState(false)
  const [restTimeRemaining, setRestTimeRemaining] = useState(0)
  const [workoutStartTime] = useState(new Date())
  const [weight, setWeight] = useState<number>(0)
  const [reps, setReps] = useState<number>(0)
  const [workoutCompleted, setWorkoutCompleted] = useState(false)
  const [showPersonalRecordAnimation, setShowPersonalRecordAnimation] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [inputMode, setInputMode] = useState<"slider" | "text">("slider")
  // Saving state management
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Initialize audio for rest timer completion
  useEffect(() => {
    audioRef.current = new Audio("/sounds/timer-complete.mp3")
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Initialize completed sets
  useEffect(() => {
    const initialCompletedSets: Record<string, WorkoutSet[]> = {}
    template.exercises.forEach((exercise) => {
      initialCompletedSets[exercise.exerciseId] = []
    })
    setCompletedSets(initialCompletedSets)
  }, [template])

  // Rest timer effect
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null

    if (isResting && restTimeRemaining > 0) {
      timerId = setTimeout(() => {
        setRestTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (isResting && restTimeRemaining === 0) {
      setIsResting(false)
      // Play sound when timer completes
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.error("Error playing sound:", err))
      }
    }

    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [isResting, restTimeRemaining])

  // Get current exercise
  const currentExercise = template.exercises[currentExerciseIndex]

  // Get current set configuration
  const currentSetConfig = currentExercise?.sets[currentSetIndex]

  // Get previous workout data for reference
  const previousWorkoutData = {
    date: "Mar 31",
    weight: 82.5,
    reps: 8,
  }

  // Format rest time as MM:SS
  const formatRestTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate workout progress
  const calculateProgress = (): number => {
    let totalSets = 0
    let completedSetCount = 0

    template.exercises.forEach((exercise) => {
      totalSets += exercise.sets.length
      completedSetCount += completedSets[exercise.exerciseId]?.length || 0
    })

    return totalSets > 0 ? (completedSetCount / totalSets) * 100 : 0
  }

  // Handle completing a set
  const completeSet = () => {
    if (!currentExercise) return

    // Validate inputs
    if (weight <= 0) {
      showErrorToast("Please enter a weight greater than 0")
      return
    }

    if (reps <= 0) {
      showErrorToast("Please enter at least 1 rep")
      return
    }

    // Create new set
    const newSet: WorkoutSet = {
      weight,
      reps,
      timestamp: new Date().toISOString(),
    }

    // Check if it's a personal record
    if (weight > previousWorkoutData.weight) {
      setShowPersonalRecordAnimation(true)
      showSuccessToast("New personal record! 🎉")
      setTimeout(() => setShowPersonalRecordAnimation(false), 3000)
    } else {
      // Provide feedback even if not a PR
      showSuccessToast(`Set completed: ${weight} lbs × ${reps} reps`)
    }

    // Update completed sets
    setCompletedSets((prev) => ({
      ...prev,
      [currentExercise.exerciseId]: [...(prev[currentExercise.exerciseId] || []), newSet],
    }))

    // Start rest timer if not the last set
    const isLastSet = currentSetIndex === currentExercise.sets.length - 1
    const isLastExercise = currentExerciseIndex === template.exercises.length - 1

    if (!isLastSet || !isLastExercise) {
      setIsResting(true)
      setRestTimeRemaining(currentSetConfig?.restTime || 60)
    }

    // Move to next set or exercise
    if (isLastSet) {
      if (isLastExercise) {
        // Workout completed
        setWorkoutCompleted(true)
      } else {
        // Move to next exercise
        setCurrentExerciseIndex((prev) => prev + 1)
        setCurrentSetIndex(0)
      }
    } else {
      // Move to next set
      setCurrentSetIndex((prev) => prev + 1)
    }

    // Reset inputs
    setWeight(0)
    setReps(0)
  }

  // Skip rest timer
  const skipRest = () => {
    setIsResting(false)
    setRestTimeRemaining(0)
    showSuccessToast("Rest period skipped")
  }

  // Finish workout with proper error handling and feedback
  const finishWorkout = useCallback(() => {
    try {
      // Show loading feedback
      showSuccessToast("Saving workout...")

      const endTime = new Date()
      const durationInSeconds = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000)

      // Validate workout data
      const completedExercises = Object.entries(completedSets).filter(([_, sets]) => sets.length > 0).length

      if (completedExercises === 0) {
        showErrorToast("Cannot save workout with no completed sets")
        return
      }

      // Create completed workout object with all metadata
      const completedWorkout = {
        id: DataManager.generateId(),
        date: workoutStartTime.toISOString(),
        duration: durationInSeconds,
        templateId: template.id,
        templateName: template.name,
        exercises: template.exercises
          .map((exercise) => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            sets: completedSets[exercise.exerciseId] || [],
          }))
          .filter((exercise) => exercise.sets.length > 0), // Only include exercises with completed sets
      }

      // Calculate and add workout statistics
      const totalVolume = Object.values(completedSets)
        .flat()
        .reduce((total, set) => total + set.weight * set.reps, 0)

      const totalSets = Object.values(completedSets).reduce((total, sets) => total + sets.length, 0)

      completedWorkout.stats = {
        totalVolume,
        totalSets,
        completedExercises,
        averageWeight: totalSets > 0 ? Math.round(totalVolume / totalSets) : 0,
      }

      // Update template's lastUsed date
      try {
        const templates = DataManager.getTemplates()
        const templateIndex = templates.findIndex((t) => t.id === template.id)
        if (templateIndex >= 0) {
          templates[templateIndex].lastUsed = new Date().toISOString()
          DataManager.saveTemplate(templates[templateIndex])
        }
      } catch (error) {
        console.error("Failed to update template's lastUsed date:", error)
        // Non-critical error, continue with workout completion
      }

      // Save workout data with persistent storage
      DataManager.saveWorkout(completedWorkout)

      // Show success message with workout stats
      showSuccessToast(
        `Workout saved: ${completedExercises} exercises, ${totalSets} sets, ${totalVolume.toLocaleString()} lbs total volume 💪`,
      )

      // Call the onComplete callback with the completed workout data
      onComplete(completedWorkout)
    } catch (error) {
      console.error("Failed to save workout:", error)
      showErrorToast("Failed to save workout. Please try again.")
    }
  }, [completedSets, onComplete, template, workoutStartTime])

  // Render rest timer screen
  if (isResting) {
    return (
      <div className="min-h-screen bg-[#1c1b1f] text-white flex flex-col">
        {/* Header */}
        <div className="p-4" style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}>
          <h1 className="text-2xl font-bold text-white">{template.name}</h1>
        </div>

        {/* Progress indicator */}
        <div className="w-full h-1 bg-gray-800">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${calculateProgress()}%`,
              backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
            }}
          ></div>
        </div>

        <div className="p-4 text-center">
          <p className="text-gray-400">{calculateProgress().toFixed(0)}% Exercises</p>
        </div>

        {/* Exercise name */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">{currentExercise?.exerciseName}</h2>
          <div
            className="w-16 h-1 mx-auto mt-2"
            style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
          ></div>
        </div>

        {/* Rest timer card */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#2a2930] p-8 rounded-lg w-full max-w-xs mx-auto">
            <div className="flex justify-center mb-4">
              <Clock className="h-10 w-10 text-white" />
            </div>
            <p className="text-center text-xl mb-6">Rest Time</p>

            <p
              className="text-center text-6xl font-mono font-bold mb-8 rest-timer"
              style={{ color: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
            >
              {formatRestTime(restTimeRemaining)}
            </p>

            <button
              className="w-full py-3 rounded-md font-bold text-black flex items-center justify-center active:scale-95 transition-transform"
              style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
              onClick={skipRest}
            >
              <FastForward className="h-5 w-5 mr-2" />
              SKIP REST
            </button>
          </div>
        </div>
      </div>
    )
  }

  // In the workoutCompleted section, replace the existing return statement with:
  if (workoutCompleted) {
    // Calculate workout statistics
    const workoutDuration = Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 60000)
    const completedExercises = Object.values(completedSets).filter((sets) => sets.length > 0).length
    const totalSets = Object.values(completedSets).reduce((total, sets) => total + sets.length, 0)
    const totalVolume = Object.values(completedSets)
      .flat()
      .reduce((total, set) => total + set.weight * set.reps, 0)
    const personalBests = Object.entries(completedSets)
      .map(([exerciseId, sets]) => {
        const exercise = template.exercises.find((e) => e.exerciseId === exerciseId)
        if (!exercise || sets.length === 0) return null

        // Find the set with the highest weight
        const maxWeightSet = [...sets].sort((a, b) => b.weight - a.weight)[0]
        return {
          exerciseName: exercise.exerciseName,
          weight: maxWeightSet.weight,
          reps: maxWeightSet.reps,
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.weight || 0) * (b?.reps || 0) - (a?.weight || 0) * (a?.reps || 0))
      .slice(0, 3)

    // Enhanced save function with loading state
    const handleSaveWorkout = async () => {
      try {
        setIsSaving(true)
        setSaveError(null)

        // Show loading feedback
        showSuccessToast("Saving your workout...")

        const endTime = new Date()
        const durationInSeconds = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000)

        // Validate workout data
        if (completedExercises === 0) {
          setSaveError("Cannot save workout with no completed sets")
          showErrorToast("Cannot save workout with no completed sets")
          setIsSaving(false)
          return
        }

        // Create completed workout object with all metadata
        const completedWorkout = {
          id: DataManager.generateId(),
          date: workoutStartTime.toISOString(),
          duration: durationInSeconds,
          templateId: template.id,
          templateName: template.name,
          exercises: template.exercises
            .map((exercise) => ({
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName,
              sets: completedSets[exercise.exerciseId] || [],
            }))
            .filter((exercise) => exercise.sets.length > 0), // Only include exercises with completed sets
          stats: {
            totalVolume,
            totalSets,
            completedExercises,
            averageWeight: totalSets > 0 ? Math.round(totalVolume / totalSets) : 0,
          },
        }

        // Update template's lastUsed date
        try {
          const templates = DataManager.getTemplates()
          const templateIndex = templates.findIndex((t) => t.id === template.id)
          if (templateIndex >= 0) {
            templates[templateIndex].lastUsed = new Date().toISOString()
            DataManager.saveTemplate(templates[templateIndex])
          }
        } catch (error) {
          console.error("Failed to update template's lastUsed date:", error)
          // Non-critical error, continue with workout completion
        }

        // Simulate network delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Save workout data with persistent storage
        DataManager.saveWorkout(completedWorkout)

        // Show success message with workout stats
        showSuccessToast(`Workout saved successfully! 💪`)

        // Call the onComplete callback with the completed workout data
        onComplete(completedWorkout)
      } catch (error) {
        console.error("Failed to save workout:", error)
        setSaveError("Failed to save workout. Please try again.")
        showErrorToast("Failed to save workout. Please try again.")
        setIsSaving(false)
      }
    }

    // Enhanced discard function with confirmation
    const handleDiscardWorkout = () => {
      // Confirm before discarding
      if (totalSets > 0) {
        if (window.confirm("Are you sure you want to discard this workout? All progress will be lost.")) {
          showSuccessToast("Workout discarded")

          // Reset all workout data
          setCompletedSets({})
          setCurrentExerciseIndex(0)
          setCurrentSetIndex(0)
          setWorkoutCompleted(false)

          // Navigate back
          onCancel()
        }
      } else {
        // No confirmation needed if no sets completed
        showSuccessToast("Workout discarded")
        onCancel()
      }
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between shadow-md"
          style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
        >
          <h1 className="text-2xl font-bold text-white">{template.name}</h1>
          <div className="text-white text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full">{workoutDuration} min</div>
        </div>

        {/* Main content - scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-md mx-auto p-4">
            {/* Congratulations section */}
            <div className="text-center mb-8 relative">
              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full opacity-30"
                    style={{
                      backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                      width: `${Math.random() * 10 + 5}px`,
                      height: `${Math.random() * 10 + 5}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                    }}
                  ></div>
                ))}
              </div>

              <div className="relative">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary bg-opacity-20 mb-4">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>

                <h2 className="text-3xl font-bold mb-2">Workout Complete!</h2>
                <p className="text-muted-foreground">Great job! You've crushed today's workout.</p>
              </div>
            </div>

            {/* Workout summary card */}
            <div className="bg-card rounded-xl shadow-lg overflow-hidden mb-6 border border-border">
              <div className="p-5 border-b border-border">
                <h3 className="text-xl font-bold">Workout Summary</h3>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 divide-x divide-y divide-border border-border">
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{completedExercises}</span>
                  <span className="text-sm text-muted-foreground">Exercises</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{totalSets}</span>
                  <span className="text-sm text-muted-foreground">Sets</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{workoutDuration}</span>
                  <span className="text-sm text-muted-foreground">Minutes</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{totalVolume.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">Total Volume (lbs)</span>
                </div>
              </div>
            </div>

            {/* Personal bests section */}
            {personalBests.length > 0 && (
              <div className="bg-card rounded-xl shadow-lg overflow-hidden mb-6 border border-border">
                <div className="p-5 border-b border-border flex items-center">
                  <div className="h-6 w-6 rounded-full bg-yellow-500 mr-2 flex items-center justify-center">
                    <span className="text-xs text-black font-bold">PB</span>
                  </div>
                  <h3 className="text-xl font-bold">Top Lifts</h3>
                </div>

                <div className="divide-y divide-border">
                  {personalBests.map((pb, index) => (
                    <div key={index} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{pb?.exerciseName}</p>
                        <p className="text-sm text-muted-foreground">{pb?.reps} reps</p>
                      </div>
                      <div className="text-xl font-bold text-primary">{pb?.weight} lbs</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error message if save failed */}
            {saveError && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-lg mb-6">
                <p>{saveError}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                className="w-full py-3 px-4 rounded-lg font-bold text-primary-foreground flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
                style={{
                  backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                  transform: "translateY(0)",
                }}
                onClick={handleSaveWorkout}
                disabled={isSaving}
                aria-disabled={isSaving}
                onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                onTouchStart={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
                onTouchEnd={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    SAVING...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    SAVE WORKOUT
                  </>
                )}
              </button>

              <button
                className="w-full py-3 px-4 rounded-lg font-medium text-muted-foreground border border-border flex items-center justify-center hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleDiscardWorkout}
                disabled={isSaving}
                aria-disabled={isSaving}
              >
                DISCARD WORKOUT
              </button>
            </div>
          </div>
        </div>

        {/* Audio element for timer sound */}
        <audio ref={audioRef} src="/sounds/timer-complete.mp3" />

        <style jsx>{`
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.2; }
            100% { transform: translateY(-1000%) rotate(720deg); opacity: 0; }
          }
          
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  // Update the set logging interface buttons
  const toggleInputMode = () => {
    const newMode = inputMode === "slider" ? "text" : "slider"
    setInputMode(newMode)
    showSuccessToast(`Switched to ${newMode} input mode`)
  }

  return (
    <div className="min-h-screen bg-[#1c1b1f] text-white flex flex-col">
      {/* Header */}
      <div className="p-4" style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}>
        <h1 className="text-2xl font-bold text-white">{template.name}</h1>
      </div>

      {/* Progress indicator */}
      <div className="w-full h-1 bg-gray-800">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${calculateProgress()}%`,
            backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
          }}
        ></div>
      </div>

      <div className="p-4 text-center">
        <p className="text-gray-400">{calculateProgress().toFixed(0)}% Exercises</p>
      </div>

      {/* Exercise name */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">{currentExercise?.exerciseName}</h2>
        <div
          className="w-16 h-1 mx-auto mt-2"
          style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
        ></div>
      </div>

      {/* Set navigation */}
      <div className="flex justify-center mb-6">
        {currentExercise?.sets.map((_, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded-full flex items-center justify-center mx-1 ${
              index < currentSetIndex
                ? "bg-gray-700 text-gray-300"
                : index === currentSetIndex
                  ? ""
                  : "bg-gray-800 text-gray-500"
            }`}
            style={
              index === currentSetIndex
                ? {
                    backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    color: "#000",
                  }
                : {}
            }
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Set card */}
      <div className="flex-1 px-4">
        <div className="bg-[#2a2930] p-6 rounded-lg max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Set {currentSetIndex + 1}</h3>
            <div className="flex items-center gap-3">
              <button
                className="text-sm px-2 py-1 rounded-md transition-colors active:scale-95"
                style={{
                  backgroundColor:
                    inputMode === "text" ? (themeColor === "default" ? "#FFA500" : "var(--md-primary)") : "transparent",
                  color: inputMode === "text" ? "black" : "white",
                  border: `1px solid ${themeColor === "default" ? "#FFA500" : "var(--md-primary)"}`,
                }}
                onClick={toggleInputMode}
                aria-label={`Switch to ${inputMode === "slider" ? "text" : "slider"} input mode`}
              >
                {inputMode === "slider" ? "Use Text Input" : "Use Slider"}
              </button>
              <div className="flex items-center">
                <span
                  className="text-2xl font-bold mr-1"
                  style={{ color: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
                >
                  {currentSetConfig?.targetReps || 0}
                </span>
                <span style={{ color: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}>reps</span>
              </div>
            </div>
          </div>

          {/* Previous workout reference */}
          <div className="bg-[#1c1b1f] p-3 rounded-md mb-4">
            <div className="text-sm text-gray-400 mb-1">Last time: {previousWorkoutData.date}</div>
            <div className="flex items-center">
              <div
                className="w-4 h-4 mr-2"
                style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
              ></div>
              <span className="font-bold">{previousWorkoutData.weight}lbs</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="font-bold">{previousWorkoutData.reps} reps</span>
            </div>
          </div>

          {/* Weight input */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Weight (lbs)</label>
            {inputMode === "slider" ? (
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="2.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={
                    {
                      "--range-thumb-bg": themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    } as React.CSSProperties
                  }
                  aria-label="Weight in pounds"
                />
                <div
                  className="w-6 h-6 rounded-full absolute pointer-events-none"
                  style={{
                    backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    left: `${(weight / 500) * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              </div>
            ) : (
              <input
                type="number"
                min="0"
                max="500"
                step="2.5"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2"
                style={{
                  focusRing: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                }}
                aria-label="Weight in pounds"
              />
            )}
            <div className="text-center mt-2 font-bold text-xl">{weight}</div>
          </div>

          {/* Reps input */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Reps Completed</label>
            {inputMode === "slider" ? (
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={
                    {
                      "--range-thumb-bg": themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    } as React.CSSProperties
                  }
                  aria-label="Number of reps"
                />
                <div
                  className="w-6 h-6 rounded-full absolute pointer-events-none"
                  style={{
                    backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    left: `${(reps / 30) * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              </div>
            ) : (
              <input
                type="number"
                min="0"
                max="30"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2"
                style={{
                  focusRing: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                }}
                aria-label="Number of reps"
              />
            )}
            <div className="text-center mt-2 font-bold text-xl">{reps}</div>
          </div>

          {/* Complete set button */}
          <button
            className="w-full py-3 rounded-md font-bold text-black flex items-center justify-center active:scale-95 transition-transform"
            style={{
              backgroundColor:
                weight > 0 && reps > 0 ? (themeColor === "default" ? "#FFA500" : "var(--md-primary)") : "#666666",
              opacity: weight > 0 && reps > 0 ? 1 : 0.7,
            }}
            onClick={completeSet}
            disabled={weight === 0 || reps === 0}
            aria-disabled={weight === 0 || reps === 0}
          >
            <Check className="h-5 w-5 mr-2" />
            COMPLETE SET
          </button>
        </div>
      </div>

      {/* Personal record animation */}
      {showPersonalRecordAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-black bg-opacity-70 p-6 rounded-lg animate-bounce">
            <h3 className="text-2xl font-bold text-white">NEW PR! 🎉</h3>
          </div>
        </div>
      )}

      {/* Audio element for timer sound */}
      <audio ref={audioRef} src="/sounds/timer-complete.mp3" />

      <style jsx>{`
      @keyframes float {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.3; }
        90% { opacity: 0.2; }
        100% { transform: translateY(-1000%) rotate(720deg); opacity: 0; }
      }
      
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--range-thumb-bg);
        cursor: pointer;
      }
      
      .active\:scale-95:active {
        transform: scale(0.95);
      }
      
      .transition-transform {
        transition: transform 0.1s ease;
      }
    `}</style>
    </div>
  )
}

