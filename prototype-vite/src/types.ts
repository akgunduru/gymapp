export type TrainingFocus = 'Gogus' | 'Bacak' | 'Kardiyo' | 'Sirt' | 'Omuz' | 'Kol'
export type UserLevel = 'Baslangic' | 'Orta' | 'Ileri'

export interface Trainer {
  id: string
  name: string
  expertise: string[]
  certificates: string[]
  experienceYear: number
}

export interface Gym {
  id: string
  name: string
  latitude: number
  longitude: number
  rating: number
  distanceKm: number
  trainers: Trainer[]
}

export interface BuddyUser {
  id: string
  name: string
  age: number
  level: UserLevel
  location: string
  distanceKm: number
  goals: TrainingFocus[]
  about: string
}

export interface Exercise {
  id: string
  name: string
  region: TrainingFocus
  level: UserLevel
  sets: number
  reps: string
  note: string
}

export interface Dietitian {
  id: string
  name: string
  specialty: string[]
  city: string
  experienceYear: number
  bio: string
}

export interface CalorieMeal {
  id: string
  title: string
  calories: number
  date: string
}
