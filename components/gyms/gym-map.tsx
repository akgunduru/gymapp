"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import {
  Dumbbell,
  LocateFixed,
  MapPin,
  Navigation,
  Star,
  Target,
} from "lucide-react";

type Coordinates = {
  lat: number;
  lng: number;
};

type Gym = Coordinates & {
  id: string;
  name: string;
  vibe: string;
  rating: number;
  color: string;
};

type GymWithDistance = Gym & {
  distanceKm: number;
};

const ISTANBUL_CENTER: Coordinates = {
  lat: 41.0082,
  lng: 28.9784,
};

const GYM_TEMPLATES = [
  {
    id: "pulse",
    name: "Pulse Club",
    vibe: "Strength and social classes",
    rating: 4.9,
    color: "#10b981",
    offset: { lat: 0.012, lng: 0.018 },
  },
  {
    id: "liftlab",
    name: "LiftLab Studio",
    vibe: "Free weights and coaching",
    rating: 4.8,
    color: "#f97316",
    offset: { lat: -0.011, lng: 0.014 },
  },
  {
    id: "flowfit",
    name: "FlowFit Hub",
    vibe: "Yoga, pilates, recovery",
    rating: 4.7,
    color: "#06b6d4",
    offset: { lat: 0.018, lng: -0.015 },
  },
  {
    id: "ironloop",
    name: "IronLoop Gym",
    vibe: "Functional training zone",
    rating: 4.6,
    color: "#8b5cf6",
    offset: { lat: -0.017, lng: -0.02 },
  },
  {
    id: "sweatsocial",
    name: "Sweat Social",
    vibe: "Group workouts and meetups",
    rating: 4.8,
    color: "#ec4899",
    offset: { lat: 0.006, lng: -0.028 },
  },
];

function buildNearbyGyms(center: Coordinates): Gym[] {
  return GYM_TEMPLATES.map((gym) => ({
    id: gym.id,
    name: gym.name,
    vibe: gym.vibe,
    rating: gym.rating,
    color: gym.color,
    lat: center.lat + gym.offset.lat,
    lng: center.lng + gym.offset.lng,
  }));
}

function distanceInKm(from: Coordinates, to: Coordinates) {
  const earthRadiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }

  return `${km.toFixed(1)} km`;
}

function createGymIcon(leaflet: typeof Leaflet, color: string) {
  return leaflet.divIcon({
    className: "gym-map-marker",
    html: `<span style="--marker-color: ${color}"><span></span></span>`,
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
  });
}

export function GymMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const markerLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>(ISTANBUL_CENTER);
  const [locationStatus, setLocationStatus] = useState(
    "Use browser geolocation to personalize the map.",
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const gyms = useMemo(() => buildNearbyGyms(mapCenter), [mapCenter]);

  const gymsWithDistance = useMemo<GymWithDistance[]>(() => {
    const origin = userLocation ?? mapCenter;

    return gyms
      .map((gym) => ({
        ...gym,
        distanceKm: distanceInKm(origin, gym),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [gyms, mapCenter, userLocation]);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (!mapRef.current || mapInstanceRef.current) {
        return;
      }

      const leaflet = await import("leaflet");

      if (cancelled || !mapRef.current) {
        return;
      }

      leafletRef.current = leaflet;

      const map = leaflet
        .map(mapRef.current, {
          center: [ISTANBUL_CENTER.lat, ISTANBUL_CENTER.lng],
          zoom: 14,
          zoomControl: false,
        })
        .setView([ISTANBUL_CENTER.lat, ISTANBUL_CENTER.lng], 14);

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(map);

      leaflet.control.zoom({ position: "bottomright" }).addTo(map);
      markerLayerRef.current = leaflet.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    initializeMap();

    return () => {
      cancelled = true;
      setIsMapReady(false);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapInstanceRef.current;
    const layer = markerLayerRef.current;

    if (!isMapReady || !leaflet || !map || !layer) {
      return;
    }

    layer.clearLayers();

    gymsWithDistance.forEach((gym) => {
      leaflet
        .marker([gym.lat, gym.lng], {
          icon: createGymIcon(leaflet, gym.color),
        })
        .bindPopup(
          `<strong>${gym.name}</strong><br>${gym.vibe}<br>${formatDistance(
            gym.distanceKm,
          )} away`,
        )
        .addTo(layer);
    });

    if (userLocation) {
      leaflet
        .marker([userLocation.lat, userLocation.lng], {
          icon: createUserIcon(leaflet),
        })
        .bindPopup("You are here")
        .addTo(layer);
    }
  }, [gymsWithDistance, isMapReady, userLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!isMapReady || !map) {
      return;
    }

    map.flyTo([mapCenter.lat, mapCenter.lng], userLocation ? 15 : 14, {
      duration: 0.9,
    });
  }, [isMapReady, mapCenter, userLocation]);

  function handleUseLocation() {
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not available in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Requesting your browser location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(nextLocation);
        setMapCenter(nextLocation);
        setLocationStatus("Showing gyms nearest to your current location.");
        setIsLocating(false);
      },
      (error) => {
        setLocationError(
          error.message || "Location permission was denied or unavailable.",
        );
        setLocationStatus("Using the default discovery area.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  }

  const closestGym = gymsWithDistance[0];

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_26%),linear-gradient(135deg,#f8fafc_0%,#ecfeff_45%,#fff7ed_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)]">
        <section className="flex flex-col gap-4">
          <div className="rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-900/10 backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Gym discovery
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                  Find a place to train nearby
                </h1>
              </div>
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-emerald-300 shadow-lg shadow-slate-900/20">
                <Dumbbell className="size-7" aria-hidden="true" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/25">
                <MapPin className="mb-2 size-5" aria-hidden="true" />
                <p className="text-2xl font-black">{gyms.length}</p>
                <p className="text-sm font-medium text-emerald-50">
                  map markers
                </p>
              </div>
              <div className="rounded-2xl bg-cyan-500 p-4 text-white shadow-lg shadow-cyan-500/25">
                <Target className="mb-2 size-5" aria-hidden="true" />
                <p className="text-2xl font-black">
                  {closestGym ? formatDistance(closestGym.distanceKm) : "-"}
                </p>
                <p className="text-sm font-medium text-cyan-50">closest gym</p>
              </div>
              <div className="rounded-2xl bg-pink-500 p-4 text-white shadow-lg shadow-pink-500/25">
                <Star className="mb-2 size-5" aria-hidden="true" />
                <p className="text-2xl font-black">4.8</p>
                <p className="text-sm font-medium text-pink-50">avg rating</p>
              </div>
            </div>

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
              {isLocating ? "Finding you..." : "Use my location"}
            </button>

            <p className="mt-3 text-sm font-medium text-slate-600">
              {locationStatus}
            </p>
            {locationError ? (
              <p className="mt-2 rounded-2xl bg-orange-100 px-4 py-3 text-sm font-semibold text-orange-800">
                {locationError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3">
            {gymsWithDistance.map((gym, index) => (
              <article
                key={gym.id}
                className="flex items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/86 p-4 shadow-lg shadow-slate-900/7 backdrop-blur-xl"
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
                      {gym.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {gym.vibe}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-black text-emerald-700">
                  {formatDistance(gym.distanceKm)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="min-h-[520px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-3 shadow-2xl shadow-cyan-900/12 backdrop-blur-xl lg:min-h-[calc(100vh-7rem)]">
          <div ref={mapRef} className="h-[70vh] min-h-[500px] rounded-[1.5rem] lg:h-full" />
        </section>
      </div>
    </main>
  );
}
