import type { BuddyUser, CalorieMeal, Dietitian, Exercise, Gym, TrainingFocus } from '../types'

export const trainingFocuses: TrainingFocus[] = ['Gogus', 'Bacak', 'Kardiyo', 'Sirt', 'Omuz', 'Kol']

export const gyms: Gym[] = [
  {
    id: 'gym-1',
    name: 'Peak Arena Besiktas',
    latitude: 41.0435,
    longitude: 29.0042,
    rating: 4.7,
    distanceKm: 1.1,
    trainers: [
      {
        id: 'tr-1',
        name: 'Mert Arslan',
        expertise: ['Fonksiyonel Antrenman', 'Kuvvet'],
        certificates: ['NASM-CPT', 'TRX Level 2'],
        experienceYear: 6,
      },
      {
        id: 'tr-2',
        name: 'Sena Guler',
        expertise: ['Pilates', 'Postur'],
        certificates: ['Balanced Body', 'ACE Coach'],
        experienceYear: 4,
      },
    ],
  },
  {
    id: 'gym-2',
    name: 'UrbanFit Sisli',
    latitude: 41.0585,
    longitude: 28.9867,
    rating: 4.5,
    distanceKm: 2.4,
    trainers: [
      {
        id: 'tr-3',
        name: 'Kaan Yilmaz',
        expertise: ['Bodybuilding', 'Beslenme Koclugu'],
        certificates: ['IFBB Level 1', 'Precision Nutrition'],
        experienceYear: 8,
      },
    ],
  },
]

export const buddyUsers: BuddyUser[] = [
  {
    id: 'u-1',
    name: 'Ece',
    age: 24,
    level: 'Orta',
    location: 'Besiktas',
    distanceKm: 0.9,
    goals: ['Gogus', 'Kol'],
    about: 'Sabah saatlerinde antrenman seviyorum, tempo yuksek.',
  },
  {
    id: 'u-2',
    name: 'Bora',
    age: 29,
    level: 'Baslangic',
    location: 'Sisli',
    distanceKm: 1.8,
    goals: ['Bacak', 'Kardiyo'],
    about: 'Rutin oturtmak istiyorum, motivasyon buddy ariyorum.',
  },
  {
    id: 'u-3',
    name: 'Derya',
    age: 27,
    level: 'Ileri',
    location: 'Nisantasi',
    distanceKm: 2.2,
    goals: ['Sirt', 'Omuz'],
    about: 'Push/pull split calisiyorum, disiplinli partner isterim.',
  },
]

export const exercises: Exercise[] = [
  { id: 'e-1', name: 'Bench Press', region: 'Gogus', level: 'Baslangic', sets: 3, reps: '10', note: 'Kontrollu negatif faz.' },
  { id: 'e-2', name: 'Incline Dumbbell Press', region: 'Gogus', level: 'Orta', sets: 4, reps: '8-10', note: 'Omuz acisini koru.' },
  { id: 'e-3', name: 'Barbell Squat', region: 'Bacak', level: 'Orta', sets: 4, reps: '6-8', note: 'Core sikili, derinlik stabil.' },
  { id: 'e-4', name: 'Leg Press', region: 'Bacak', level: 'Baslangic', sets: 3, reps: '12', note: 'Dizleri kilitleme.' },
  { id: 'e-5', name: 'Rower Intervals', region: 'Kardiyo', level: 'Ileri', sets: 6, reps: '40sn/20sn', note: 'Yuksek efor interval.' },
  { id: 'e-6', name: 'Lat Pulldown', region: 'Sirt', level: 'Baslangic', sets: 3, reps: '12', note: 'Dirsekleri alta cek.' },
]

export const dietitians: Dietitian[] = [
  {
    id: 'd-1',
    name: 'Uzm. Dyt. Irmak Kurt',
    specialty: ['Kilo Kontrolu', 'Sporcu Beslenmesi'],
    city: 'Istanbul',
    experienceYear: 7,
    bio: 'Yogun tempolu profesyoneller icin uygulanabilir planlar hazirlar.',
  },
  {
    id: 'd-2',
    name: 'Uzm. Dyt. Arda Tunc',
    specialty: ['Klinik Beslenme', 'Gut Health'],
    city: 'Ankara',
    experienceYear: 5,
    bio: 'Kan degerlerine gore bireysel beslenme rotasi cizer.',
  },
]

export const calorieHistory: CalorieMeal[] = [
  { id: 'm-1', title: 'Tavuklu bowl', calories: 520, date: 'Bugun 12:30' },
  { id: 'm-2', title: 'Yogurt + granola', calories: 340, date: 'Bugun 09:00' },
]

export const mockAiPredictions = [
  { fileName: 'meal-1.jpg', meal: 'Izgara tavuk + bulgur', calories: 610 },
  { fileName: 'meal-2.jpg', meal: 'Avokadolu tost', calories: 430 },
]
