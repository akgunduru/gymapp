/**
 * fetch-ankara-gyms.mjs
 *
 * Overpass API'den Ankara'daki gerçek spor salonlarını çeker ve
 * data/ankara-gyms.ts dosyasını otomatik olarak yeniden yazar.
 *
 * Kullanım:
 *   node scripts/fetch-ankara-gyms.mjs
 *
 * Node 18+ gerektirir (built-in fetch).
 * Daha eski Node için: npm i node-fetch ve import değiştir.
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, "../data/ankara-gyms.ts");

// ── Overpass sorgusu ──────────────────────────────────────────────────────────
// Ankara bounding box: güney 39.70 / batı 32.50 / kuzey 40.10 / doğu 33.20
const QUERY = `[out:json][timeout:40];
(
  node["leisure"="fitness_centre"](39.70,32.50,40.10,33.20);
  way["leisure"="fitness_centre"](39.70,32.50,40.10,33.20);
  node["sport"="fitness"](39.70,32.50,40.10,33.20);
  way["sport"="fitness"](39.70,32.50,40.10,33.20);
  node["leisure"="sports_centre"]["sport"="fitness"](39.70,32.50,40.10,33.20);
  way["leisure"="sports_centre"]["sport"="fitness"](39.70,32.50,40.10,33.20);
);
out center tags;`;

// ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────

/** Koordinatlara göre Ankara ilçesini tahmin eder */
function guessDistrict(lat, lng) {
  if (lat < 39.84) return "Gölbaşı";
  if (lat > 39.97 && lng < 32.73) return "Sincan";
  if (lat > 39.96) return "Keçiören";
  if (lat > 39.94 && lng < 32.80) return "Yenimahalle";
  if (lat > 39.94) return "Keçiören";
  if (lng < 32.72) return "Yenimahalle";
  if (lng > 32.90) return "Mamak";
  if (lat > 39.93) return "Altındağ";
  if (lat > 39.92 && lng > 32.85) return "Altındağ";
  return "Çankaya";
}

/** OSM tag'lerine göre gym tipini belirler */
function guessType(tags) {
  const name = (tags.name || "").toLowerCase();
  const sport = (tags.sport || "").toLowerCase();
  if (sport === "yoga" || name.includes("yoga") || name.includes("pilates")) return "yoga";
  if (sport === "crossfit" || name.includes("crossfit")) return "crossfit";
  if (tags.leisure === "sports_centre") return "sports-club";
  if (name.includes("studio") || name.includes("stüdyo")) return "studio";
  return "gym";
}

/** Sıradaki renk döndürür (25 gym için yeterli palet) */
const COLORS = [
  "#10b981", "#f97316", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f59e0b", "#06b6d4", "#ef4444", "#14b8a6", "#6366f1",
  "#84cc16", "#a855f7", "#0ea5e9", "#f43f5e", "#64748b",
  "#10b981", "#f97316", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f59e0b", "#06b6d4", "#ef4444", "#14b8a6", "#6366f1",
];
let colorIndex = 0;
const nextColor = () => COLORS[colorIndex++ % COLORS.length];

/** OSM adres tag'lerinden okunabilir adres oluşturur */
function buildAddress(tags, district) {
  const parts = [];
  if (tags["addr:street"]) {
    parts.push(tags["addr:street"]);
    if (tags["addr:housenumber"]) parts.push(`No:${tags["addr:housenumber"]}`);
  }
  parts.push(district);
  return parts.filter(Boolean).join(", ");
}

/** OSM opening_hours veya bilinen zincir isimlerine göre amenities tahmin eder */
function guessAmenities(tags) {
  const name = (tags.name || "").toLowerCase();
  const amenities = ["Cardio Equipment", "Free Weights", "Locker Rooms"];
  if (name.includes("macfit") || name.includes("gold") || name.includes("fit life"))
    amenities.push("Group Classes", "Sauna");
  if (name.includes("yoga") || name.includes("pilates"))
    return ["Yoga Studio", "Pilates", "Locker Rooms"];
  if (name.includes("crossfit"))
    return ["CrossFit", "Free Weights", "Personal Training"];
  if (tags["sport"] === "swimming" || name.includes("aqua"))
    amenities.push("Pool");
  if (tags["sauna"] === "yes") amenities.push("Sauna");
  return [...new Set(amenities)];
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
console.log("⏳  Overpass API'den Ankara gym verileri çekiliyor...");

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: `data=${encodeURIComponent(QUERY)}`,
});

if (!res.ok) {
  console.error(`❌  HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const json = await res.json();
console.log(`✅  ${json.elements.length} element bulundu.`);

// ── İşle ─────────────────────────────────────────────────────────────────────
const seen = new Set();
const gyms = [];

for (const el of json.elements) {
  const tags = el.tags || {};
  const name = tags.name?.trim();

  // İsimsizleri atla
  if (!name) continue;

  // Duplikatları temizle (aynı isim zaten eklendiyse atla)
  const key = name.toLowerCase().replace(/\s+/g, "");
  if (seen.has(key)) continue;
  seen.add(key);

  // Koordinat: node → doğrudan, way → center
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!lat || !lng) continue;

  const district = guessDistrict(lat, lng);
  const type = guessType(tags);
  const address = buildAddress(tags, district);

  // OSM'de rating yok; bilinen zincirler için sabit, diğerleri için 4.0–4.5
  const chainRatings = { macfit: 4.5, "gold's gym": 4.8, "fit life": 4.4 };
  const nameLower = name.toLowerCase();
  const rating =
    Object.entries(chainRatings).find(([k]) => nameLower.includes(k))?.[1] ??
    parseFloat((4.0 + Math.random() * 0.5).toFixed(1));

  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  gyms.push({
    id,
    name,
    district,
    address: address || `${district}, Ankara`,
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6)),
    rating,
    amenities: guessAmenities(tags),
    type,
    color: nextColor(),
  });
}

console.log(`🏋️  İsimli ve koordinatlı ${gyms.length} gym işlendi.`);

if (gyms.length === 0) {
  console.error("❌  Hiç gym bulunamadı. Sorgu veya bounding box kontrol edilmeli.");
  process.exit(1);
}

// ── TypeScript dosyasını yaz ──────────────────────────────────────────────────
const lines = gyms.map((g) => {
  const amenitiesStr = g.amenities.map((a) => `"${a}"`).join(", ");
  return `  {
    id: "${g.id}",
    name: "${g.name.replace(/"/g, '\\"')}",
    district: "${g.district}",
    address: "${g.address.replace(/"/g, '\\"')}",
    lat: ${g.lat},
    lng: ${g.lng},
    rating: ${g.rating},
    amenities: [${amenitiesStr}],
    type: "${g.type}",
    color: "${g.color}",
  }`;
});

const ts = `// Bu dosya otomatik olarak scripts/fetch-ankara-gyms.mjs tarafından üretilmiştir.
// Kaynak: OpenStreetMap / Overpass API — © OpenStreetMap contributors
// Son güncelleme: ${new Date().toISOString().slice(0, 10)}

export type GymType = "gym" | "studio" | "crossfit" | "sports-club" | "yoga";

export type AnkaraGym = {
  id: string;
  name: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  amenities: string[];
  type: GymType;
  color: string;
};

export const ANKARA_GYMS: AnkaraGym[] = [
${lines.join(",\n")}
];
`;

writeFileSync(OUT_FILE, ts, "utf8");
console.log(`✅  ${gyms.length} gym → ${OUT_FILE} dosyasına yazıldı.`);
console.log("👉  Şimdi 'npm run dev' ile uygulamayı yeniden başlatabilirsin.");
