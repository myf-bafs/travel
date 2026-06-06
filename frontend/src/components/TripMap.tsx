import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TripPlan } from "../types";

interface Props {
  plan: TripPlan;
  activeDayKey: string;
}

const DAY_COLORS = ["#003472", "#CD2E3A", "#D4A843", "#2D7D46", "#6B3FA0", "#E8734A", "#1E88E5"];

export function TripMap({ plan, activeDayKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([36.5, 127.5], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const dayKeys = Object.keys(plan.itinerary).sort((a, b) =>
      parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""))
    );

    // Remove old layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);
    const activeCoords: L.LatLng[] = [];

    dayKeys.forEach((key, dayIdx) => {
      const day = plan.itinerary[key];
      const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
      const isActive = key === activeDayKey;
      const opacity = isActive ? 0.5 : 0.15;

      day.schedule.forEach((item) => {
        if (item.lat != null && item.lng != null) {
          const pos = L.latLng(item.lat, item.lng);
          bounds.extend(pos);

          if (isActive) activeCoords.push(pos);

          const marker = L.marker(pos, {
            icon: L.divIcon({
              className: "",
              html: `<div style="
                width: ${isActive ? 30 : 24}px; height: ${isActive ? 30 : 24}px; border-radius: 50%;
                background: ${color}; color: white;
                display: flex; align-items: center; justify-content: center;
                font-size: ${isActive ? 11 : 9}px; font-weight: bold;
                border: 2.5px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,${isActive ? 0.25 : 0.1});
                opacity: ${opacity + 0.5};
              ">${dayIdx + 1}</div>`,
              iconSize: isActive ? [30, 30] : [24, 24],
              iconAnchor: isActive ? [15, 15] : [12, 12],
            }),
          }).addTo(map);

          marker.bindPopup(`
            <div style="min-width:160px;font-family:sans-serif">
              <div style="font-weight:700;font-size:13px;margin-bottom:2px">${item.spot_name}</div>
              <div style="color:#666;font-size:11px">${day.date} · ${item.time_slots}</div>
            </div>
          `);
        }
      });

      // Route line
      const coords = day.schedule
        .filter((s) => s.lat != null && s.lng != null)
        .map((s) => L.latLng(s.lat!, s.lng!));

      if (coords.length > 1) {
        L.polyline(coords, {
          color,
          weight: isActive ? 3 : 1.5,
          opacity,
          dashArray: isActive ? "6, 8" : "4, 6",
        }).addTo(map);
      }
    });

    // Fly to active day's spots
    if (activeCoords.length > 0) {
      const activeBounds = L.latLngBounds(activeCoords);
      map.flyToBounds(activeBounds, { padding: [60, 60], maxZoom: 14, duration: 0.8 });
    } else if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, duration: 0.8 });
    }
  }, [plan, activeDayKey]);

  return (
    <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-200">
      <div ref={containerRef} className="h-[220px] w-full sm:h-[280px]" />
      <div className="flex flex-wrap gap-3 border-t border-gray-100 bg-white px-4 py-2.5 text-xs text-gray-500">
        {Object.keys(plan.itinerary).map((key, i) => (
          <span key={key} className={`flex items-center gap-1.5 ${key === activeDayKey ? "font-bold text-gray-800" : ""}`}>
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }} />
            第{i + 1}天
          </span>
        ))}
        <span className="ml-auto text-[10px] text-gray-300">
          {Object.values(plan.itinerary).reduce((sum, d) => sum + d.schedule.length, 0)} 個景點
        </span>
      </div>
    </div>
  );
}
