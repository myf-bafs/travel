import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TripPlan } from "../types";

interface Props {
  plan: TripPlan;
  activeDayKey: string;
}

const COLORS = ["#0052cc", "#CD2E3A", "#D4A843", "#2D7D46", "#6B3FA0"];

export function TripMap({ plan, activeDayKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false }).setView([20, 0], 2);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 18 }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((l) => { if (l instanceof L.Marker || l instanceof L.Polyline) map.removeLayer(l); });

    const dayKeys = Object.keys(plan.itinerary).sort((a, b) =>
      parseInt(a.replace(/\D/g,"")) - parseInt(b.replace(/\D/g,""))
    );
    const bounds = L.latLngBounds([]);
    const activeCoords: L.LatLng[] = [];

    dayKeys.forEach((key, di) => {
      const day = plan.itinerary[key];
      const color = COLORS[di % COLORS.length];
      const isActive = key === activeDayKey;
      const coords: L.LatLng[] = [];

      day.schedule.forEach((item, si) => {
        if (item.lat != null && item.lng != null) {
          const pos = L.latLng(item.lat, item.lng);
          coords.push(pos);
          bounds.extend(pos);
          if (isActive) activeCoords.push(pos);
          const m = L.marker(pos, {
            icon: L.divIcon({
              className: "",
              html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;opacity:${isActive?1:0.3};font-size:10px;font-weight:bold;color:white">${di+1}</div>`,
              iconSize: [22, 22], iconAnchor: [11, 11],
            }),
          }).addTo(map);
          m.bindPopup(`<b>${si+1}. ${item.spot_name}</b>`);
        }
      });

      if (coords.length > 1) {
        L.polyline(coords, { color, weight: isActive ? 3 : 1.5, opacity: isActive ? 0.6 : 0.15, dashArray: "6, 8" }).addTo(map);
      }
    });

    if (activeCoords.length > 0) {
      map.flyToBounds(L.latLngBounds(activeCoords), { padding: [40, 40], maxZoom: 14, duration: 0.6 });
    } else if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 12, duration: 0.6 });
    }
  }, [plan, activeDayKey]);

  return <div ref={ref} className="w-full h-52 rounded-xl overflow-hidden shadow" />;
}
