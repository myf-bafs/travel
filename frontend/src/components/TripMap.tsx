import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TripPlan } from "../types";

interface Props {
  plan: TripPlan;
  activeDayKey: string;
}

const COLORS = ["#0052cc", "#CD2E3A", "#D4A843", "#2D7D46", "#6B3FA0", "#E8734A"];

export function TripMap({ plan, activeDayKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([20, 0], 2);

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; CARTO",
      maxZoom: 18,
    }).addTo(map);

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
      const color = COLORS[dayIdx % COLORS.length];
      const isActive = key === activeDayKey;
      const opacity = isActive ? 0.6 : 0.12;

      const dayCoords: L.LatLng[] = [];

      day.schedule.forEach((item, spotIdx) => {
        if (item.lat != null && item.lng != null) {
          const pos = L.latLng(item.lat, item.lng);
          dayCoords.push(pos);
          bounds.extend(pos);
          if (isActive) activeCoords.push(pos);

          const marker = L.marker(pos, {
            icon: L.divIcon({
              className: "",
              html: `<div style="
                background-color: ${color}; width: ${isActive ? 24 : 20}px; height: ${isActive ? 24 : 20}px;
                border-radius: 50%; border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,${isActive ? 0.3 : 0.1});
                display: flex; align-items: center; justify-content: center;
                opacity: ${opacity + 0.4};
              "><div style="width:6px; height:6px; background:white; border-radius:50%;"></div></div>`,
              iconSize: isActive ? [24, 24] : [20, 20],
              iconAnchor: isActive ? [12, 12] : [10, 10],
            }),
          }).addTo(map);

          marker.bindPopup(`
            <div style="min-width:140px;font-family:sans-serif">
              <b>${spotIdx + 1}. ${item.spot_name}</b>
              <div style="color:#666;font-size:11px;margin-top:2px">${item.time_slots || ""}</div>
            </div>
          `);
        }
      });

      // Route line
      if (dayCoords.length > 1) {
        L.polyline(dayCoords, {
          color,
          weight: isActive ? 4 : 2,
          opacity,
          dashArray: "8, 8",
        }).addTo(map);
      }
    });

    if (activeCoords.length > 0) {
      const activeBounds = L.latLngBounds(activeCoords);
      map.flyToBounds(activeBounds, { padding: [50, 50], maxZoom: 14, duration: 0.8 });
    } else if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, duration: 0.8 });
    }
  }, [plan, activeDayKey]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px]" />
  );
}
