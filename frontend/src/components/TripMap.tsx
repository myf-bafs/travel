import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DayPlan, TripPlan } from "../types";

interface Props {
  plan: TripPlan;
}

const DAY_COLORS = ["#003472", "#CD2E3A", "#D4A843", "#2D7D46", "#6B3FA0", "#E8734A", "#1E88E5"];

export function TripMap({ plan }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([36.5, 127.5], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    const allItems: { dayIdx: number; item: any }[] = [];
    const dayKeys = Object.keys(plan.itinerary).sort((a, b) => {
      return parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""));
    });

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    dayKeys.forEach((key, dayIdx) => {
      const day = plan.itinerary[key];
      const color = DAY_COLORS[dayIdx % DAY_COLORS.length];

      day.schedule.forEach((item, idx) => {
        if (item.lat != null && item.lng != null) {
          const pos = L.latLng(item.lat, item.lng);
          bounds.extend(pos);

          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width: 32px; height: 32px; border-radius: 50%;
              background: ${color}; color: white;
              display: flex; align-items: center; justify-content: center;
              font-size: 12px; font-weight: bold; border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">${dayIdx + 1}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker(pos, { icon }).addTo(map);

          const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
          const [y, m, d] = day.date.split("-").map(Number);
          const dow = dayNames[new Date(y, m - 1, d).getDay()];

          marker.bindPopup(`
            <div style="min-width:180px">
              <div style="font-weight:700;font-size:14px;margin-bottom:2px">${item.spot_name}</div>
              <div style="color:#666;font-size:12px">第${dayIdx + 1}天（${day.date} 週${dow}）</div>
              <div style="color:#666;font-size:12px">${item.time_slots}</div>
            </div>
          `);
        }
      });
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60] });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [plan]);

  return (
    <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200">
      <div ref={containerRef} className="h-[400px] w-full" />
      <div className="flex flex-wrap gap-3 border-t border-gray-100 bg-white px-5 py-3 text-xs text-gray-500">
        {Object.keys(plan.itinerary).map((key, i) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }}
            />
            第 {i + 1} 天
          </span>
        ))}
      </div>
    </div>
  );
}
