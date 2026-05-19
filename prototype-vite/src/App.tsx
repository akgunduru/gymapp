import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { Activity, CalendarClock, Flame, HeartPulse, MessageCircle, Users } from 'lucide-react'
import { buddyUsers, dietitians, exercises, gyms, trainingFocuses } from './data/mockData'
import { useAppState } from './state/AppContext'

interface ChatMessage {
  id: string
  sender: 'me' | 'buddy'
  content: string
  time: string
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const { selectedFocus, setSelectedFocus, selectedLevel, setSelectedLevel, calorieGoal, caloriesConsumed, meals, addMealFromImage } =
    useAppState()
  const [selectedGymId, setSelectedGymId] = useState(gyms[0]?.id)
  const [selectedDiet, setSelectedDiet] = useState('Tum')
  const [mealPhotoFile, setMealPhotoFile] = useState<File | null>(null)
  const [mealPhotoPreview, setMealPhotoPreview] = useState('')
  const [mealDescription, setMealDescription] = useState('')
  const [mealUploadError, setMealUploadError] = useState('')
  const [userLocation, setUserLocation] = useState<[number, number]>([41.047, 28.99])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [appointmentNotice, setAppointmentNotice] = useState('')
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({
    'u-1': [
      { id: 'c1', sender: 'buddy', content: 'Merhaba! Saat 19:00 gibi gidelim mi?', time: '18:10' },
      { id: 'c2', sender: 'me', content: 'Olur, ben de o saatte musaitim.', time: '18:11' },
    ],
  })

  const selectedGym = gyms.find((gym) => gym.id === selectedGymId) ?? gyms[0]
  const matchedBuddies = buddyUsers.filter((user) => user.goals.includes(selectedFocus))
  const workoutPlan = exercises.filter((item) => item.region === selectedFocus && item.level === selectedLevel)
  const remainingCalories = calorieGoal - caloriesConsumed
  const activeProfile = buddyUsers.find((user) => user.id === activeProfileId) ?? null
  const activeChatUser = buddyUsers.find((user) => user.id === activeChatId) ?? null
  const activeChatMessages = activeChatId ? chats[activeChatId] ?? [] : []

  const filteredDietitians = useMemo(() => {
    if (selectedDiet === 'Tum') return dietitians
    return dietitians.filter((dietitian) => dietitian.specialty.includes(selectedDiet))
  }, [selectedDiet])

  const requestLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation([position.coords.latitude, position.coords.longitude])
    })
  }

  const sendMessage = () => {
    if (!activeChatId || !chatInput.trim()) return
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'me',
      content: chatInput.trim(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    }
    setChats((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), newMessage],
    }))
    setChatInput('')
  }

  const requestAppointment = (dietitianName: string) => {
    setAppointmentNotice(`${dietitianName} icin randevu talebin alindi. Uzman en kisa surede geri donecek.`)
    window.setTimeout(() => setAppointmentNotice(''), 3500)
  }

  useEffect(() => {
    return () => {
      if (mealPhotoPreview) URL.revokeObjectURL(mealPhotoPreview)
    }
  }, [mealPhotoPreview])

  const onMealPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMealUploadError('Lutfen sadece gorsel dosyasi sec.')
      return
    }
    setMealUploadError('')
    if (mealPhotoPreview) URL.revokeObjectURL(mealPhotoPreview)
    setMealPhotoFile(file)
    setMealPhotoPreview(URL.createObjectURL(file))
  }

  const estimateMealCalories = () => {
    if (!mealPhotoFile) {
      setMealUploadError('Once bir yemek fotografi sec.')
      return
    }
    if (!mealDescription.trim()) {
      setMealUploadError('Lutfen yemek icerigini acikla (ornek: salata, 100 gr tavuk, 250 gr yesillik).')
      return
    }
    setMealUploadError('')
    addMealFromImage(mealPhotoFile, mealDescription)
    setMealDescription('')
  }

  const submitAuth = () => {
    if (authMode === 'register' && !authName.trim()) {
      setAuthError('Kayit icin ad soyad gerekli.')
      return
    }
    if (!authEmail.includes('@')) {
      setAuthError('Gecerli bir e-posta gir.')
      return
    }
    if (authPassword.length < 6) {
      setAuthError('Sifre en az 6 karakter olmali.')
      return
    }
    setAuthError('')
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-slate-900 p-6 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">FitConnect</p>
          <h1 className="mt-2 text-2xl font-bold">{authMode === 'login' ? 'Hesabina Giris Yap' : 'Yeni Hesap Olustur'}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {authMode === 'login'
              ? 'Gym Buddy, kalori takip ve antrenman modullerine eris.'
              : 'Dakikalar icinde hesap olusturup platformu kullanmaya basla.'}
          </p>

          <div className="mt-5 space-y-3">
            {authMode === 'register' ? (
              <input
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
                placeholder="Ad Soyad"
                className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
              />
            ) : null}
            <input
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="E-posta"
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            />
            <input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Sifre"
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            />
          </div>

          {authError ? <p className="mt-3 text-sm text-orange-300">{authError}</p> : null}

          <button
            onClick={submitAuth}
            className="mt-5 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-900"
          >
            {authMode === 'login' ? 'Giris Yap' : 'Kayit Ol'}
          </button>

          <button
            onClick={() => {
              setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
              setAuthError('')
            }}
            className="mt-3 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
          >
            {authMode === 'login' ? 'Hesabin yok mu? Kayit ol' : 'Zaten hesabin var mi? Giris yap'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {appointmentNotice ? (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {appointmentNotice}
          </div>
        ) : null}
        <header className="rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-6 backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">MVP Platform</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Saglik, Spor ve Sosyal Yardimlasma Platformu</h1>
          <p className="mt-3 max-w-3xl text-slate-300">Yakindaki salonlari kesfet, Gym Buddy bul, antrenman plani olustur ve AI destekli kalori takibini tek ekranda yonet.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><HeartPulse className="h-5 w-5 text-emerald-400" />Harita: Spor Salonu ve Antrenor</h2>
              <button onClick={requestLocation} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900">Konumumu Al</button>
            </div>
            <div className="h-72 overflow-hidden rounded-xl">
              <iframe
                title="Yakindaki spor salonlari haritasi"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation[1] - 0.04}%2C${userLocation[0] - 0.02}%2C${userLocation[1] + 0.04}%2C${userLocation[0] + 0.02}&layer=mapnik`}
                className="h-full w-full border-0"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {gyms.map((gym) => (
                <button
                  key={gym.id}
                  onClick={() => setSelectedGymId(gym.id)}
                  className={`rounded-md px-3 py-1.5 text-sm ${selectedGymId === gym.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}
                >
                  {gym.name}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">{selectedGym.distanceKm} km • Puan: {selectedGym.rating}</p>
              <h3 className="text-lg font-semibold">{selectedGym.name}</h3>
              <div className="mt-3 space-y-3">
                {selectedGym.trainers.map((trainer) => (
                  <div key={trainer.id} className="rounded-lg border border-slate-700 p-3">
                    <p className="font-medium">{trainer.name} ({trainer.experienceYear} yil)</p>
                    <p className="text-sm text-slate-300">Uzmanlik: {trainer.expertise.join(', ')}</p>
                    <p className="text-xs text-amber-300">Sertifika: {trainer.certificates.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Users className="h-5 w-5 text-orange-400" />Gym Buddy Eslesme</h2>
            <div className="flex flex-wrap gap-2">
              {trainingFocuses.map((focus) => (
                <button
                  key={focus}
                  onClick={() => setSelectedFocus(focus)}
                  className={`rounded-full px-3 py-1.5 text-sm ${selectedFocus === focus ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-slate-200'}`}
                >
                  {focus}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {matchedBuddies.map((buddy) => (
                <div key={buddy.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{buddy.name}, {buddy.age}</p>
                    <span className="text-xs text-emerald-300">{buddy.distanceKm} km</span>
                  </div>
                  <p className="text-sm text-slate-300">{buddy.level} • {buddy.location}</p>
                  <p className="mt-2 text-sm text-slate-300">{buddy.about}</p>
                  <p className="mt-2 text-xs text-orange-300">Bugunku bolgeler: {buddy.goals.join(', ')}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setActiveProfileId(buddy.id)}
                      className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-900"
                    >
                      Profili Incele
                    </button>
                    <button
                      onClick={() => setActiveChatId(buddy.id)}
                      className="rounded-md border border-slate-600 px-3 py-1.5 text-sm"
                    >
                      <MessageCircle className="mr-1 inline h-4 w-4" />
                      Mesaj
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Activity className="h-5 w-5 text-emerald-400" />Kisisel Antrenman Programi</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {(['Baslangic', 'Orta', 'Ileri'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`rounded-md px-3 py-1.5 text-sm ${selectedLevel === level ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {workoutPlan.length ? workoutPlan.map((exercise) => (
                <div key={exercise.id} className="rounded-lg border border-slate-700 p-3">
                  <p className="font-semibold">{exercise.name}</p>
                  <p className="text-sm text-slate-300">{exercise.sets} set • {exercise.reps} tekrar</p>
                  <p className="text-xs text-slate-400">{exercise.note}</p>
                </div>
              )) : <p className="text-sm text-slate-400">Secim icin oneri bulunamadi.</p>}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Flame className="h-5 w-5 text-orange-400" />AI Destekli Kalori Takibi</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">Gunluk Hedef</p>
                <p className="text-2xl font-bold text-emerald-400">{calorieGoal} kcal</p>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">Tuketilen</p>
                <p className="text-2xl font-bold text-orange-400">{caloriesConsumed} kcal</p>
                <p className="text-xs text-slate-400">Kalan: {remainingCalories} kcal</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-slate-700 p-3">
              <p className="text-sm font-medium">Yemek fotografi yukle (mock AI tahmin)</p>
              <div className="mt-2 flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onMealPhotoChange}
                  className="w-full rounded-md bg-slate-800 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-1.5 file:font-semibold file:text-slate-900"
                />
                {mealPhotoPreview ? (
                  <img src={mealPhotoPreview} alt="Yuklenen yemek fotografi" className="h-36 w-full rounded-md object-cover" />
                ) : null}
                <textarea
                  value={mealDescription}
                  onChange={(event) => setMealDescription(event.target.value)}
                  placeholder="Icerik aciklamasi gir: salata, 100 gr tavuk, 250 gr yesillik..."
                  rows={3}
                  className="w-full rounded-md bg-slate-800 p-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
                />
                {mealUploadError ? <p className="text-xs text-orange-300">{mealUploadError}</p> : null}
                <button onClick={estimateMealCalories} className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-slate-900">Tahmin Et ve Ekle</button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between rounded-md bg-slate-950/60 px-3 py-2 text-sm">
                  <span>{meal.title} <span className="text-xs text-slate-400">({meal.date})</span></span>
                  <span className="font-semibold">{meal.calories} kcal</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><CalendarClock className="h-5 w-5 text-emerald-400" />Diyetisyen Entegrasyonu</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {['Tum', 'Sporcu Beslenmesi', 'Kilo Kontrolu', 'Klinik Beslenme', 'Gut Health'].map((specialty) => (
                <button key={specialty} onClick={() => setSelectedDiet(specialty)} className={`rounded-full px-3 py-1.5 text-xs ${selectedDiet === specialty ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800'}`}>
                  {specialty}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredDietitians.map((dietitian) => (
                <div key={dietitian.id} className="rounded-lg border border-slate-700 p-3">
                  <p className="font-semibold">{dietitian.name}</p>
                  <p className="text-sm text-slate-300">{dietitian.city} • {dietitian.experienceYear} yil</p>
                  <p className="text-sm text-slate-400">{dietitian.bio}</p>
                  <p className="mt-1 text-xs text-orange-300">{dietitian.specialty.join(', ')}</p>
                  <button
                    onClick={() => requestAppointment(dietitian.name)}
                    className="mt-2 rounded-md border border-emerald-500 px-3 py-1.5 text-sm text-emerald-300"
                  >
                    Randevu / Iletisim
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-xl font-semibold">Supabase Veri Modeli (MVP)</h2>
            <p className="mb-3 text-sm text-slate-300">Asagidaki SQL, kullanicilar, antrenorler, diyetisyenler, salonlar ve mesajlar icin temel semayi olusturur.</p>
            <a href="/supabase-schema.sql" className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900">Schema Dosyasini Ac</a>
          </article>
        </section>
      </div>

      {activeProfile ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{activeProfile.name} Profili</h3>
              <button onClick={() => setActiveProfileId(null)} className="rounded-md bg-slate-800 px-2 py-1 text-xs">Kapat</button>
            </div>
            <p className="text-sm text-slate-300">{activeProfile.level} • {activeProfile.location} • {activeProfile.distanceKm} km</p>
            <p className="mt-3 text-sm text-slate-300">{activeProfile.about}</p>
            <p className="mt-2 text-xs text-orange-300">Calismak istedigi bolgeler: {activeProfile.goals.join(', ')}</p>
            <button
              onClick={() => {
                setActiveChatId(activeProfile.id)
                setActiveProfileId(null)
              }}
              className="mt-4 rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900"
            >
              Sohbet Baslat
            </button>
          </div>
        </div>
      ) : null}

      {activeChatUser ? (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
            <h3 className="text-sm font-semibold">{activeChatUser.name} ile Sohbet</h3>
            <button onClick={() => setActiveChatId(null)} className="rounded-md bg-slate-800 px-2 py-1 text-xs">Kapat</button>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto p-3">
            {activeChatMessages.length ? activeChatMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.sender === 'me' ? 'ml-auto bg-emerald-500/20 text-emerald-200' : 'bg-slate-800 text-slate-200'
                }`}
              >
                <p>{message.content}</p>
                <p className="mt-1 text-right text-[10px] text-slate-400">{message.time}</p>
              </div>
            )) : <p className="text-xs text-slate-400">Henuz mesaj yok.</p>}
          </div>
          <div className="flex gap-2 border-t border-slate-700 p-3">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendMessage()
              }}
              placeholder="Mesaj yaz..."
              className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            />
            <button onClick={sendMessage} className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-slate-900">Gonder</button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default App
