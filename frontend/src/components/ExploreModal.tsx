import { useState } from "react";
import { getPopularSpots } from "../types";

interface Props {
  destination: string;
  dayKeys: string[];
  existingSpots: string[];
  onAdd: (spot: string, dayKey: string) => void;
  onClose: () => void;
}

export function ExploreModal({ destination, dayKeys, existingSpots, onAdd, onClose }: Props) {
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const spots = getPopularSpots(destination);

  const handleAdd = (spot: string, dayKey: string) => {
    onAdd(spot, dayKey);
    setAdded((prev) => ({ ...prev, [`${dayKey}:${spot}`]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [`${dayKey}:${spot}`]: false })), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-800">🔍 探索 {destination} 景點</h2>
          <button onClick={onClose} className="text-lg text-gray-400 active:text-gray-600">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {spots.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">暫無推薦景點清單</p>
          ) : (
            <div className="space-y-2">
              {spots.map((spot) => {
                const alreadyAdded = existingSpots.includes(spot);
                return (
                  <div key={spot} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{spot}</p>
                    </div>
                    <div className="flex gap-1">
                      {dayKeys.map((key) => {
                        const id = `${key}:${spot}`;
                        return (
                          <button
                            key={key}
                            onClick={() => handleAdd(spot, key)}
                            disabled={alreadyAdded}
                            className={`rounded-lg px-2 py-1 text-[10px] font-medium transition ${
                              added[id]
                                ? "bg-green-500 text-white"
                                : alreadyAdded
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                : "bg-korea-blue/10 text-korea-blue active:bg-korea-blue/20"
                            }`}
                          >
                            {added[id] ? "✓" : alreadyAdded ? "已加入" : `+${key.replace("day_", "D")}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
