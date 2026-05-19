# Saglik, Spor ve Sosyal Yardimlasma Platformu (MVP)

Bu proje, modern ve responsive bir web uygulamasi olarak React + Tailwind CSS ile gelistirilmis MVP'dir.

## Teknoloji Secimi

- Frontend: React (Vite + TypeScript)
- UI: Tailwind CSS (koyu tema, canli yesil/turuncu vurgu)
- State management: Context API
- Harita: Leaflet / React-Leaflet
- Backend hedefi: Supabase (ornek schema: `public/supabase-schema.sql`)

## Dosya Yapisi Plani

```txt
health-sport-social-platform/
  public/
    supabase-schema.sql
  src/
    data/
      mockData.ts
    state/
      AppContext.tsx
    App.tsx
    index.css
    main.tsx
    types.ts
```

## MVP Modulleri

1. Harita tabanli spor salonu ve antrenor kesfi
2. Gym Buddy eslesme kartlari + mesajlasma arayuzu taslagi
3. Seviye ve bolgeye gore kisisel antrenman programi
4. AI destekli kalori takibi (mock tahmin akisiyla)
5. Uzmanlik filtreli diyetisyen listesi + randevu/iletisim CTA

## Calistirma

```bash
npm install
npm run dev
```
