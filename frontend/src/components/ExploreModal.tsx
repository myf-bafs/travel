import { useState } from "react";
import { GLOBAL_SPOTS, GlobalSpot } from "../types";

interface Props {
  destination: string;
  dayKeys: string[];
  existingSpots: string[];
  onAdd: (spot: GlobalSpot, dayKey: string) => void;
  onClose: () => void;
}

export function ExploreModal({ destination, dayKeys, existingSpots, onAdd, onClose }: Props) {
  const [q, setQ] = useState("");
  const spots = GLOBAL_SPOTS.filter(s =>
    (destination.includes(s.city) || s.city.includes(destination)) &&
    (!q || s.name.includes(q) || s.city.includes(q))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-bold text-sm">🔍 探索景點</h3>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>
        <div className="px-4 py-2 border-b">
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="搜尋景點..." className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {spots.map(s => {
            const added = existingSpots.includes(s.name);
            return (
              <div key={s.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </div>
                <div className="flex gap-1">
                  {dayKeys.map(k => (
                    <button key={k} onClick={() => onAdd(s, k)} disabled={added}
                      className={`text-xs px-2 py-1 rounded-lg font-medium transition ${
                        added ? "bg-gray-100 text-gray-300" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}>
                      {added ? "✓" : k.replace("day_","Day")}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {spots.length === 0 && <p className="text-center text-gray-400 text-sm py-8">無符合景點</p>}
        </div>
      </div>
    </div>
  );
}
