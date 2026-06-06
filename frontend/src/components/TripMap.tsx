import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TripPlan } from "../types";

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
      zoomControl: false,
      attributionControl: false,
    }).setView([36.5, 127.5], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    const dayKeys = Object.keys(plan.itinerary).sort((a, b) => {
      return parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""));
    });

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    dayKeys.forEach((key, dayIdx) => {
      const day = plan.itinerary[key];
      const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
      const dayCoords: L.LatLng[] = [];

      day.schedule.forEach((item) => {
        if (item.lat != null && item.lng != null) {
          const pos = L.latLng(item.lat, item.lng);
          dayCoords.push(pos);
          bounds.extend(pos);

          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width: 30px; height: 30px; border-radius: 50%;
              background: ${color}; color: white;
              display: flex; align-items: center; justify-content: center;
              font-size: 11px; font-weight: bold; border: 2.5px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            ">${dayIdx + 1}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const marker = L.marker(pos, { icon }).addTo(map);

          const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
          const [y, m, d] = day.date.split("-").map(Number);
          const dow = dayNames[new Date(y, m - 1, d).getDay()];

          marker.bindPopup(`
            <div style="min-width:160px;font-family:sans-serif">
              <div style="font-weight:700;font-size:13px;margin-bottom:2px">${item.spot_name}</div>
              <div style="color:#666;font-size:11px">第${dayIdx + 1}天 · ${day.date} 週${dow}</div>
              <div style="color:#999;font-size:11px">${item.time_slots}</div>
            </div>
          `);
        }
      });

      // Draw route line for this day
      if (dayCoords.length > 1) {
        const polyline = L.polyline(dayCoords, {
          color,
          weight: 2.5,
          opacity: 0.5,
          dashArray: "6, 8",
        }).addTo(map);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [plan]);

  return (
    <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-200">
      <div ref={containerRef} className="h-[220px] w-full sm:h-[280px]" />
      <div className="flex flex-wrap gap-3 border-t border-gray-100 bg-white px-4 py-2.5 text-xs text-gray-500">
        {Object.keys(plan.itinerary).map((key, i) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }}
            />
            第 {i + 1} 天
          </span>
        ))}
        <span className="ml-auto text-[10px] text-gray-300">
          {Object.values(plan.itinerary).reduce(
            (sum, d) => sum + d.schedule.length,
            0
          )}{" "}
          個景點
        </span>
      </div>
    </div>
  );
}
