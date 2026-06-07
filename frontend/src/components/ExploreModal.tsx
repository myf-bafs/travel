import { useState } from "react";
import { GLOBAL_SPOTS, GlobalSpot } from "../types";
import { MapPin } from "@phosphor-icons/react";

interface Props {
  destination: string;
  dayKeys: string[];
  existingSpots: string[];
  onAdd: (spot: GlobalSpot, dayKey: string) => void;
  onClose: () => void;
}

export function ExploreModal({ destination, dayKeys, existingSpots, onAdd, onClose }: Props) {
  const [search, setSearch] = useState("");

  const spots = GLOBAL_SPOTS.filter((s) => {
    const matchesCity = destination.includes(s.city) || s.city.includes(destination);
    const matchesSearch = !search || s.name.includes(search) || s.city.includes(search);
    return matchesCity && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] modal-enter">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="text-primary-blue" size={22} weight="fill" />
            探索景點
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md transition">
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋景點（如：晴空塔、羅浮宮）..."
              className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-blue outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spots.map((s) => {
            const added = existingSpots.includes(s.name);
            return (
              <div key={s.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition cursor-pointer bg-white flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="text-primary-blue" size={16} weight="fill" />
                      {s.name}
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{s.city}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{s.desc}</p>
                </div>
                <div className="flex gap-1.5 mt-3">
                  {dayKeys.map((key) => (
                    <button
                      key={key}
                      onClick={() => onAdd(s, key)}
                      disabled={added}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                        added
                          ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                          : "bg-slate-50 hover:bg-blue-50 text-primary-blue border border-slate-200 hover:border-blue-200"
                      }`}
                    >
                      {added ? "✓ 已加入" : `+ ${key.replace("day_", "Day ")}`}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {spots.length === 0 && (
            <div className="col-span-2 py-10 text-center text-slate-400 text-sm">
              沒有符合的景點
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
