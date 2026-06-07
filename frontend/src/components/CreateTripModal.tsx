import { useState } from "react";
import { GLOBAL_SPOTS } from "../types";
import { ArrowsDownUp, MapPin, CalendarBlank, AirplaneTilt } from "@phosphor-icons/react";

interface Props {
  onSubmit: (data: { destination: string; startDate: string; totalDays: number; spots?: string[] }) => void;
  loading: boolean;
  onClose: () => void;
}

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const CITIES = [...new Set(GLOBAL_SPOTS.map((s) => s.city))];

export function CreateTripModal({ onSubmit, loading, onClose }: Props) {
  const [destination, setDestination] = useState("東京");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [totalDays, setTotalDays] = useState(3);

  const handleSubmit = () => {
    if (!destination || !startDate) return;
    onSubmit({ destination, startDate, totalDays });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden modal-enter p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AirplaneTilt className="text-primary-blue" size={24} weight="fill" />
            建立新旅程
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition">
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">目的地 (城市或國家)</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例如：東京、巴黎、台北..."
              list="city-list"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-blue outline-none text-sm"
            />
            <datalist id="city-list">
              {CITIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">出發日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-blue outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">天數</label>
              <div className="flex items-center gap-2">
                {DAYS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setTotalDays(n)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition ${
                      totalDays === n
                        ? "bg-primary-blue text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !destination || !startDate}
          className="w-full bg-primary-blue hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-8 transition shadow-md disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" />
              AI 規劃中...
            </span>
          ) : (
            "開始規劃畫布"
          )}
        </button>
      </div>
    </div>
  );
}
