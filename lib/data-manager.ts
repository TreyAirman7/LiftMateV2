// This is a simplified version of the data manager
// In a real implementation, this would handle all localStorage operations

export interface Exercise {
  id: string
  name: string
  muscles: string[]
}

export interface WorkoutSet {
  weight: number
  reps: number
  timestamp: string
}

export interface ExerciseInWorkout {
  exerciseId: string
  exerciseName: string
  sets: WorkoutSet[]
}

// Update the WorkoutTemplate interface to include category and description
export interface WorkoutTemplate {
  id: string
  name: string
  description?: string | null
  category?: string | null
  lastUsed: string | null
  exercises: {
    exerciseId: string
    exerciseName: string
    sets: {
      targetReps: number
      restTime: number
    }[]
  }[]
}

export interface CompletedWorkout {
  id: string
  date: string
  duration: number
  templateId: string | null
  templateName: string | null
  exercises: ExerciseInWorkout[]
}

// Update the UserSettings interface to include theme
export interface UserSettings {
  weightUnit: "kg" | "lbs"
  theme: string
  darkMode: boolean
}

export interface UserProfile {
  name: string
  sex: string
  age: number
  joinDate: string
}

// Storage keys
const STORAGE_KEYS = {
  EXERCISES: "liftmate-exercises",
  TEMPLATES: "liftmate-templates",
  WORKOUTS: "liftmate-workouts",
  ACTIVE_WORKOUT: "liftmate-active-workout",
  SETTINGS: "liftmate-settings",
  USER_PROFILE: "liftmate-user-profile",
}

// Helper to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Update the initializeStorage function to include a default template
const initializeStorage = (): void => {
  // Check if storage is already initialized
  if (localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    return
  }

  // Default settings
  const defaultSettings: UserSettings = {
    weightUnit: "lbs",
    theme: "teal",
    darkMode: false,
  }

  // Default user profile
  const defaultProfile: UserProfile = {
    name: "User",
    sex: "",
    age: 0,
    joinDate: new Date().toISOString(),
  }

  // Default exercises with more comprehensive list
  const defaultExercises: Exercise[] = [
    { id: generateId(), name: "Bench Press", muscles: ["chest", "triceps", "shoulders"] },
    { id: generateId(), name: "Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Deadlift", muscles: ["back", "glutes", "hamstrings"] },
    { id: generateId(), name: "Overhead Press", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Pull-up", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Barbell Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Leg Press", muscles: ["quads", "glutes"] },
    { id: generateId(), name: "Dumbbell Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Tricep Extension", muscles: ["triceps"] },
    { id: generateId(), name: "Lateral Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Ab Rollout", muscles: ["abs", "shoulders"] },
    { id: generateId(), name: "Arnold Press", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Back Extension", muscles: ["back", "hamstrings", "glutes"] },
    { id: generateId(), name: "Back Squat", muscles: ["quads", "hamstrings", "glutes", "legs"] },
    { id: generateId(), name: "Bar Triceps Pushdown", muscles: ["triceps"] },
    { id: generateId(), name: "Barbell Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Barbell Floor Press", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Barbell Hip Thrust", muscles: ["glutes", "hamstrings"] },
    { id: generateId(), name: "Barbell Row", muscles: ["back", "biceps", "forearms", "traps"] },
    { id: generateId(), name: "Barbell Shrug", muscles: ["traps"] },
    { id: generateId(), name: "Bench Dips", muscles: ["triceps"] },
    { id: generateId(), name: "Bench Press", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Bent-Over Row", muscles: ["back"] },
    { id: generateId(), name: "Bicep Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Box Jump", muscles: ["quads", "hamstrings"] },
    { id: generateId(), name: "Bulgarian Split Squat", muscles: ["quads", "hamstrings"] },
    { id: generateId(), name: "Cable Crunch", muscles: ["abs"] },
    { id: generateId(), name: "Cable Fly", muscles: ["chest"] },
  ]

  // Create exercise ID map for reference in templates
  const exerciseIdMap: Record<string, string> = {}
  defaultExercises.forEach((exercise) => {
    exerciseIdMap[exercise.name] = exercise.id
  })

  // Default template - Full Body Workout
  const defaultTemplate: WorkoutTemplate = {
    id: generateId(),
    name: "Full Body Workout",
    lastUsed: new Date().toISOString(), // Set as recently used
    exercises: [
      {
        exerciseId: exerciseIdMap["Squat"] || generateId(),
        exerciseName: "Squat",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 8, restTime: 90 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Bench Press"] || generateId(),
        exerciseName: "Bench Press",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 10, restTime: 60 },
          { targetReps: 8, restTime: 60 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Barbell Row"] || generateId(),
        exerciseName: "Barbell Row",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 10, restTime: 60 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Overhead Press"] || generateId(),
        exerciseName: "Overhead Press",
        sets: [
          { targetReps: 10, restTime: 60 },
          { targetReps: 10, restTime: 60 },
          { targetReps: 8, restTime: 60 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Bicep Curl"] || generateId(),
        exerciseName: "Bicep Curl",
        sets: [
          { targetReps: 12, restTime: 45 },
          { targetReps: 12, restTime: 45 },
          { targetReps: 12, restTime: 45 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Tricep Extension"] || generateId(),
        exerciseName: "Tricep Extension",
        sets: [
          { targetReps: 12, restTime: 45 },
          { targetReps: 12, restTime: 45 },
          { targetReps: 12, restTime: 45 },
        ],
      },
    ],
  }

  // Save defaults to localStorage
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings))
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile))
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(defaultExercises))
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify([defaultTemplate]))
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]))
}

// Get settings
const getSettings = (): UserSettings => {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return settings ? JSON.parse(settings) : null
}

// Save settings
const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// Get user profile
const getUserProfile = (): UserProfile => {
  const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
  return profile ? JSON.parse(profile) : null
}

// Save user profile
const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
}

// Get all templates
const getTemplates = (): WorkoutTemplate[] => {
  const templates = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
  return templates ? JSON.parse(templates) : []
}

// Save template
const saveTemplate = (template: WorkoutTemplate): void => {
  const templates = getTemplates()
  const index = templates.findIndex((t) => t.id === template.id)

  if (index >= 0) {
    templates[index] = template
  } else {
    templates.push(template)
  }

  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
}

// Delete template
const deleteTemplate = (id: string): void => {
  const templates = getTemplates()
  const filteredTemplates = templates.filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filteredTemplates))
}

// Get all workouts
const getWorkouts = (): CompletedWorkout[] => {
  const workouts = localStorage.getItem(STORAGE_KEYS.WORKOUTS)
  return workouts ? JSON.parse(workouts) : []
}

// Save workout
const saveWorkout = (workout: CompletedWorkout): void => {
  const workouts = getWorkouts()
  const index = workouts.findIndex((w) => w.id === workout.id)

  if (index >= 0) {
    workouts[index] = workout
  } else {
    workouts.push(workout)
  }

  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts))
}

// Delete workout
const deleteWorkout = (id: string): void => {
  const workouts = getWorkouts()
  const filteredWorkouts = workouts.filter((w) => w.id !== id)
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filteredWorkouts))
}

// Get exercises
const getExercises = (): Exercise[] => {
  const exercises = localStorage.getItem(STORAGE_KEYS.EXERCISES)
  return exercises ? JSON.parse(exercises) : []
}

// Save exercise
const saveExercise = (exercise: Exercise): void => {
  const exercises = getExercises()
  const index = exercises.findIndex((e) => e.id === exercise.id)

  if (index >= 0) {
    exercises[index] = exercise
  } else {
    exercises.push(exercise)
  }

  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises))
}

// Delete exercise
const deleteExercise = (id: string): void => {
  const exercises = getExercises()
  const filteredExercises = exercises.filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(filteredExercises))
}

// Export the data manager
const DataManager = {
  initializeStorage,
  generateId,
  getSettings,
  saveSettings,
  getUserProfile,
  saveUserProfile,
  getTemplates,
  saveTemplate,
  deleteTemplate,
  getWorkouts,
  saveWorkout,
  deleteWorkout,
  getExercises,
  saveExercise,
  deleteExercise,
}

export default DataManager

