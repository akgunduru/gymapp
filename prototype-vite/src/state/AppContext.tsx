import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { calorieHistory } from '../data/mockData'
import type { CalorieMeal, TrainingFocus, UserLevel } from '../types'

interface AppState {
  selectedFocus: TrainingFocus
  setSelectedFocus: (focus: TrainingFocus) => void
  selectedLevel: UserLevel
  setSelectedLevel: (level: UserLevel) => void
  calorieGoal: number
  caloriesConsumed: number
  meals: CalorieMeal[]
  addMealFromImage: (file: File, description: string) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedFocus, setSelectedFocus] = useState<TrainingFocus>('Gogus')
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>('Baslangic')
  const [calorieGoal] = useState(2200)
  const [meals, setMeals] = useState<CalorieMeal[]>(calorieHistory)

  const caloriesConsumed = useMemo(() => meals.reduce((sum, meal) => sum + meal.calories, 0), [meals])

  const addMealFromImage = (file: File, description: string) => {
    const lowerDescription = description.toLowerCase()
    const gramMatches = [...lowerDescription.matchAll(/(\d+)\s*gr/g)]
    const totalGrams = gramMatches.reduce((sum, match) => sum + Number(match[1]), 0)
    const gramBasedCalories = totalGrams > 0 ? Math.round(totalGrams * 1.6) : 0
    const proteinBoost = /(tavuk|et|balik|ton|yumurta)/.test(lowerDescription) ? 140 : 0
    const saladDiscount = /(salata|yesillik|sebze)/.test(lowerDescription) ? -80 : 0
    const fallbackByImageSize = 220 + Math.min(520, Math.round(file.size / 1500))
    const estimatedCalories = Math.max(120, gramBasedCalories + proteinBoost + saladDiscount || fallbackByImageSize)
    const normalizedName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    setMeals((prev) => [
      {
        id: crypto.randomUUID(),
        title: `${normalizedName || 'Yemek Fotografi'} - ${description.trim() || 'Aciklama yok'} (AI Tahmin)`,
        calories: estimatedCalories,
        date: 'Simdi',
      },
      ...prev,
    ])
  }

  const value = {
    selectedFocus,
    setSelectedFocus,
    selectedLevel,
    setSelectedLevel,
    calorieGoal,
    caloriesConsumed,
    meals,
    addMealFromImage,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState AppProvider icinde kullanilmalidir.')
  }
  return context
}
