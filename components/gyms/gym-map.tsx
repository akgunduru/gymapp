"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type * as Leaflet from "leaflet";
import {
  Dumbbell,
  Info,
  LocateFixed,
  MapPin,
  Maximize2,
  Navigation,
  Star,
  Target,
  X,
} from "lucide-react";
import { ANKARA_GYMS, type AnkaraGym } from "@/data/ankara-gyms";

type Coordinates = {
  lat: number;
  lng: number;
};

type GymWithDistance = AnkaraGym & {
  distanceKm: number;
};

const ANKARA_CENTER: Coordinates = {
  lat: 39.9208,
  lng: 32.8541,
};

/** Haversine formula — returns distance in km between two lat/lng points. */
function haversineKm(from: Coordinates, to: Coordinates): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

const TYPE_LABELS: Record<AnkaraGym["type"], string> = {
  gym: "Gym",
  studio: "Studio",
  crossfit: "CrossFit",
  "sports-club": "Sports Club",
  yoga: "Yoga / Pilates",
};

function createGymIcon(leaflet: typeof Leaflet, color: string) {
  return leaflet.divIcon({
    className: "gym-map-marker",
    html: `<span style="--marker-color:${color}"><span></span></span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 38],
    popupAnchor: [0, -34],
  });
}

function createUserIcon(leaflet: typeof Leaflet) {
  return leaflet.divIcon({
    className: "gym-map-user-marker",
    html: "<span><span></span></span>",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
}

export function GymMap() {
  /* ── Normal map refs ──────────────────────────────────────────────────── */
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const gymLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  /** Separate ref so clearLayers() on the gym layer never removes the user pin. */
  const userMarkerRef = useRef<Leaflet.Marker | null>(null);
  /** gym id → Leaflet.Marker, so card clicks can open the right popup. */
  const markerRefsMap = useRef<Map<string, Leaflet.Marker>>(new Map());

  /* ── Fullscreen map refs ──────────────────────────────────────────────── */
  const fullscreenMapRef = useRef<HTMLDivElement | null>(null);
  const fullscreenMapInstanceRef = useRef<Leaflet.Map | null>(null);
  const fullscreenGymLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const fullscreenUserMarkerRef = useRef<Leaflet.Marker | null>(null);
  /**
   * Snapshot of center/zoom at the moment the user hits "Expand map".
   * Stored in refs so the fullscreen init effect doesn't need them as deps.
   */
  const expandCenterRef = useRef<[number, number]>([
    ANKARA_CENTER.lat,
    ANKARA_CENTER.lng,
  ]);
  const expandZoomRef = useRef<number>(12);
  /**
   * Frozen snapshot of gym data for the fullscreen map.
   * Updated on every render so it's always current when the modal opens.
   */
  const gymsSnapshotRef = useRef<GymWithDistance[]>([]);
  const userLocationSnapshotRef = useRef<Coordinates | null>(null);

  /* ── State ────────────────────────────────────────────────────────────── */
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState(
    "Use browser geolocation to sort gyms by real distance.",
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  /** ID of the gym card the user last clicked — highlights that card. */
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  /** Guard: only render the portal after hydration. */
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  /* ── Derived data ─────────────────────────────────────────────────────── */
  const gymsWithDistance = useMemo<GymWithDistance[]>(() => {
    const origin = userLocation ?? ANKARA_CENTER;
    return ANKARA_GYMS.map((gym) => ({
      ...gym,
      distanceKm: haversineKm(origin, gym),
    })).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [userLocation]);

  const avgRating = useMemo(() => {
    const sum = ANKARA_GYMS.reduce((acc, g) => acc + g.rating, 0);
    return (sum / ANKARA_GYMS.length).toFixed(1);
  }, []);

  /* Keep snapshot refs in sync so fullscreen always uses fresh data. */
  gymsSnapshotRef.current = gymsWithDistance;
  userLocationSnapshotRef.current = userLocation;

  /* ── Normal map: initialise once on mount ─────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (!mapRef.current || mapInstanceRef.current) return;
      const leaflet = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      leafletRef.current = leaflet;

      const map = leaflet.map(mapRef.current, {
        center: [ANKARA_CENTER.lat, ANKARA_CENTER.lng],
        zoom: 12,
        zoomControl: false,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(map);

      leaflet.control.zoom({ position: "bottomright" }).addTo(map);
      gymLayerRef.current = leaflet.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      // Force Leaflet to re-measure the container. Critical when the map
      // is inside a sticky/transformed layout where the initial getBoundingClientRect
      // may return zeroes before paint.
      map.invalidateSize();
      setIsMapReady(true);
    }

    initializeMap();

    return () => {
      cancelled = true;
      setIsMapReady(false);
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      gymLayerRef.current = null;
    };
  }, []);

  /* ── Normal map: gym markers (redrawn on distance change) ──────────────── */
  useEffect(() => {
    const leaflet = leafletRef.current;
    const layer = gymLayerRef.current;
    if (!isMapReady || !leaflet || !layer) return;

    layer.clearLayers(); // only the gym layer — user marker is untouched
    markerRefsMap.current.clear();

    gymsWithDistance.forEach((gym) => {
      const marker = leaflet
        .marker([gym.lat, gym.lng], { icon: createGymIcon(leaflet, gym.color) })
        .bindPopup(
          `<strong>${gym.name}</strong><br>` +
            `${gym.district} · ${TYPE_LABELS[gym.type]}<br>` +
            `${gym.address}<br>` +
            `⭐ ${gym.rating.toFixed(1)} &nbsp;·&nbsp; ` +
            `<strong>${formatDistance(gym.distanceKm)}</strong> away`,
        )
        .addTo(layer);
      markerRefsMap.current.set(gym.id, marker);
    });
  }, [gymsWithDistance, isMapReady]);

  /* ── Normal map: user marker (independent of gym layer) ──────────────── */
  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!isMapReady || !leaflet || !map) return;

    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    if (!userLocation) return;

    userMarkerRef.current = leaflet
      .marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(leaflet),
        zIndexOffset: 1000,
      })
      .addTo(map)
      .bindPopup("<strong>📍 You are here</strong>")
      .openPopup();
  }, [userLocation, isMapReady]);

  /* ── Fullscreen map: init on open, destroy on close ──────────────────── */
  useEffect(() => {
    if (!isExpanded) {
      fullscreenUserMarkerRef.current?.remove();
      fullscreenUserMarkerRef.current = null;
      fullscreenMapInstanceRef.current?.remove();
      fullscreenMapInstanceRef.current = null;
      fullscreenGymLayerRef.current = null;
      return;
    }

    /*
     * The modal DOM is rendered synchronously before this effect runs,
     * but we give the browser one tick to paint the container so that
     * Leaflet can measure it correctly and tiles load without a blank flash.
     */
    const timer = setTimeout(() => {
      if (!fullscreenMapRef.current || fullscreenMapInstanceRef.current) return;
      const leaflet = leafletRef.current;
      if (!leaflet) return;

      const map = leaflet.map(fullscreenMapRef.current, {
        center: expandCenterRef.current,
        zoom: expandZoomRef.current,
        zoomControl: false,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(map);

      leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      const gymLayer = leaflet.layerGroup().addTo(map);
      fullscreenGymLayerRef.current = gymLayer;

      // Draw current gym markers using the snapshot captured at open time
      gymsSnapshotRef.current.forEach((gym) => {
        leaflet
          .marker([gym.lat, gym.lng], { icon: createGymIcon(leaflet, gym.color) })
          .bindPopup(
            `<strong>${gym.name}</strong><br>` +
              `${gym.district} · ${TYPE_LABELS[gym.type]}<br>` +
              `${gym.address}<br>` +
              `⭐ ${gym.rating.toFixed(1)} &nbsp;·&nbsp; ` +
              `<strong>${formatDistance(gym.distanceKm)}</strong> away`,
          )
          .addTo(gymLayer);
      });

      // User marker
      const loc = userLocationSnapshotRef.current;
      if (loc) {
        fullscreenUserMarkerRef.current = leaflet
          .marker([loc.lat, loc.lng], {
            icon: createUserIcon(leaflet),
            zIndexOffset: 1000,
          })
          .addTo(map)
          .bindPopup("<strong>📍 You are here</strong>")
          .openPopup();
      }

      fullscreenMapInstanceRef.current = map;
      // Force tile redraw after the modal finishes its CSS transition
      map.invalidateSize();
    }, 80);

    return () => clearTimeout(timer);
  }, [isExpanded]); // snapshot refs keep data fresh without adding deps

  /* ── Prevent body scroll while modal is open ──────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  /* ── Geolocation — unchanged ──────────────────────────────────────────── */
  function handleUseLocation() {
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not available in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Requesting your browser location…");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(coords);
        setLocationStatus("Sorted by real distance from your GPS location.");
        setIsLocating(false);

        // Imperative flyTo — no effect chain needed
        mapInstanceRef.current?.flyTo([coords.lat, coords.lng], 13, {
          duration: 1.2,
        });
      },
      (error) => {
        setLocationError(
          error.message || "Location permission was denied or unavailable.",
        );
        setLocationStatus("Showing gyms sorted by distance from Ankara centre.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  }

  /** Click a gym card → fly map to it and open its marker popup. */
  function handleGymCardClick(gym: GymWithDistance) {
    setSelectedGymId(gym.id);
    const map = mapInstanceRef.current;
    const marker = markerRefsMap.current.get(gym.id);
    if (!map || !marker) return;
    map.flyTo([gym.lat, gym.lng], 15, { duration: 0.8 });
    // Open popup after the fly animation settles
    setTimeout(() => marker.openPopup(), 850);
  }

  function handleExpand() {
    const map = mapInstanceRef.current;
    if (map) {
      const c = map.getCenter();
      expandCenterRef.current = [c.lat, c.lng];
      expandZoomRef.current = map.getZoom();
    }
    setIsExpanded(true);
  }

  const closestGym = gymsWithDistance[0];

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_26%),linear-gradient(135deg,#f8fafc_0%,#ecfeff_45%,#fff7ed_100%)] px-4 py-6 sm:px-6 lg:px-8">
      {/*
        Two-column grid:
          left  — header card + gym list (scrolls naturally with the page)
          right — sticky map card (stays fixed in viewport as list scrolls)
      */}
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)]">

        {/* ── LEFT column ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">

          {/* Header / controls card */}
          <div className="rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-900/10 backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Gym discovery · Ankara
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                  Find a place to train nearby
                </h1>
              </div>
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-emerald-300 shadow-lg shadow-slate-900/20">
                <Dumbbell className="size-7" aria-hidden="true" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/25">
                <MapPin className="mb-2 size-5" aria-hidden="true" />
                <p className="text-2xl font-black">{ANKARA_GYMS.length}</p>
                <p className="text-sm font-medium text-emerald-50">gyms listed</p>
              </div>
              <div className="rounded-2xl bg-cyan-500 p-4 text-white shadow-lg shadow-cyan-500/25">
                <Target className="mb-2 size-5" aria-hidden="true" />
                <p className="text-2xl font-black">
                  {closestGym ? formatDistance(closestGym.distanceKm) : "—"}
                </p>
                <p className="text-sm font-medium text-cyan-50">closest gym</p>
              </div>
              <div className="rounded-2xl bg-pink-500 p-4 text-white shadow-lg shadow-pink-500/25">
                <Star className="mb-2 size-5" aria-hidden="true" />
                <p className="text-2xl font-black">{avgRating}</p>
                <p className="text-sm font-medium text-pink-50">avg rating</p>
              </div>
            </div>

            {/* Locate button */}
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-75"
            >
              {isLocating ? (
                <Navigation className="size-5 animate-pulse" aria-hidden="true" />
              ) : (
                <LocateFixed className="size-5" aria-hidden="true" />
              )}
              {isLocating ? "Finding you…" : "Use my location"}
            </button>

            <p className="mt-3 text-sm font-medium text-slate-600">
              {locationStatus}
            </p>

            {locationError ? (
              <p className="mt-2 rounded-2xl bg-orange-100 px-4 py-3 text-sm font-semibold text-orange-800">
                {locationError}
              </p>
            ) : null}

            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Info className="size-3.5 shrink-0" aria-hidden="true" />
              Gym distances are calculated from your live GPS location.
            </p>
          </div>

          {/* Gym list — grows naturally; the sticky map stays put as this scrolls */}
          <div className="grid gap-3">
            {gymsWithDistance.map((gym, index) => (
              <article
                key={gym.id}
                role="button"
                tabIndex={0}
                aria-label={`Focus ${gym.name} on map`}
                onClick={() => handleGymCardClick(gym)}
                onKeyDown={(e) => e.key === "Enter" && handleGymCardClick(gym)}
                className={[
                  "flex cursor-pointer items-center gap-4 rounded-[1.5rem] border p-4 shadow-lg backdrop-blur-xl transition-all duration-200",
                  selectedGymId === gym.id
                    ? "border-emerald-400 bg-emerald-50/80 shadow-emerald-200 ring-2 ring-emerald-400"
                    : "border-white/70 bg-white/86 shadow-slate-900/7 hover:border-emerald-200 hover:bg-white/95",
                ].join(" ")}
              >
                <div
                  className="grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: gym.color,
                    boxShadow: `0 14px 28px ${gym.color}38`,
                  }}
                >
                  <span className="text-sm font-black">{index + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="truncate text-base font-black text-slate-950">
                      {gym.name}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                      ⭐ {gym.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                    {gym.district} · {TYPE_LABELS[gym.type]}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {gym.address}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {gym.amenities.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {a}
                      </span>
                    ))}
                    {gym.amenities.length > 3 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        +{gym.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <p className="shrink-0 text-sm font-black text-emerald-700">
                  {formatDistance(gym.distanceKm)}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── RIGHT column: sticky map card ────────────────────────────── */}
        {/*
          lg:self-start  — sizes the grid track to the card height, not the row height
          lg:sticky      — card stays in the viewport while the left column scrolls
          lg:top-[5.5rem]— clears the navbar (≈ 5 rem tall)
        */}
        {/*
          Sticky map card.
          lg:self-start  → grid track sized to card, not to the taller left column.
          lg:sticky      → card pins to viewport top as the gym list scrolls past.
        */}
        <section className="lg:sticky lg:top-[5.5rem] lg:self-start">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-3 shadow-2xl shadow-cyan-900/12 backdrop-blur-xl">
            {/*
              Wrapper has an INLINE height so the expand button can be absolutely
              positioned and Leaflet always measures a concrete pixel value.

              Tailwind v4's JIT sometimes fails to emit arbitrary-value responsive
              classes (h-[360px] / lg:h-[520px]) for files it hasn't fully scanned,
              which would leave the div at height:0 and produce a blank map.
              Inline style bypasses the CSS pipeline entirely — always safe.
            */}
            <div
              className="relative rounded-[1.5rem]"
              style={{ height: 520 }}
            >
              {/* Expand button — z-[500] floats above all Leaflet pane layers */}
              <button
                type="button"
                onClick={handleExpand}
                aria-label="Expand map"
                className="absolute right-3 top-3 z-[500] flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:shadow-lg"
              >
                <Maximize2 className="size-3.5" aria-hidden="true" />
                Expand map
              </button>

              {/*
                Leaflet container — fills the wrapper absolutely so its measured
                size exactly matches the 520 px inline height above.
              */}
              <div
                ref={mapRef}
                className="absolute inset-0 rounded-[1.5rem]"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ── Fullscreen modal (portal — avoids any ancestor overflow:hidden) ── */}
      {isMounted &&
        isExpanded &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Expanded gym map"
            className="fixed inset-0 z-[9999] flex flex-col bg-black/75 p-3 backdrop-blur-sm sm:p-5"
          >
            <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-[2rem] bg-white shadow-2xl">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Close expanded map"
                className="absolute right-4 top-4 z-[500] flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:shadow-lg"
              >
                <X className="size-3.5" aria-hidden="true" />
                Close
              </button>

              {/*
                Fullscreen map container — explicit calc height so Leaflet never
                measures zero. p-3 sm:p-5 on the modal = 12–20 px padding;
                2 × 20px (sm padding) + 2 × 2px rounding buffer = ~80px overhead.
              */}
              <div
                ref={fullscreenMapRef}
                className="absolute inset-0 rounded-[2rem]"
              />
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
