import { useState } from "react";
import { TripFormData, POPULAR_SPOTS, PACE_OPTIONS } from "../types";

interface Props {
  onSubmit: (data: TripFormData) => void;
  loading: boolean;
  onClose: () => void;
}

const DESTINATIONS = Object.keys(POPULAR_SPOTS);

export function CreateTripModal({ onSubmit, loading, onClose }: Props) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [totalDays, setTotalDays] = useState(2);
  const [dailyStartTime, setDailyStartTime] = useState("09:00");
  const [dailyEndTime, setDailyEndTime] = useState("21:00");
  const [hotelName, setHotelName] = useState("");
  const [pace, setPace] = useState<TripFormData["pace"]>("一般");
  const [step, setStep] = useState<"destination" | "details">("destination");

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const handleDestinationSelect = (d: string) => {
    setDestination(d);
    setStep("details");
  };

  const handleSubmit = () => {
    if (!destination || !startDate || !hotelName) return;
    onSubmit({
      destination,
      startDate,
      totalDays,
      dailyStartTime,
      dailyEndTime,
      hotelName,
      spots: [],
      pace,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-800">
            {step === "destination" ? "🌍 建立新旅程" : "📅 行程細節"}
          </h2>
          <button onClick={onClose} className="text-lg text-gray-400 active:text-gray-600">✕</button>
        </div>

        {step === "destination" ? (
          <div className="px-5 py-4">
            <p className="mb-3 text-xs text-gray-500">選擇目的地</p>
            <div className="grid grid-cols-3 gap-2">
              {DESTINATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDestinationSelect(d)}
                  className="rounded-xl border border-gray-200 px-3 py-3 text-center text-sm font-medium text-gray-700 active:bg-korea-blue/5 active:border-korea-blue/30"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 px-5 py-4">
            <div>
              <p className="mb-1 text-xs text-gray-400">目的地</p>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-korea-blue/10 px-2.5 py-1 text-sm font-medium text-korea-blue">{destination}</span>
                <button onClick={() => setStep("destination")} className="text-xs text-gray-400 underline">更換</button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-400">出發日期</label>
              <input
                type="date"
                value={startDate}
                min={minDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-korea-blue focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">天數</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTotalDays(Math.max(1, totalDays - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500"
                  >−</button>
                  <span className="min-w-[2ch] text-center text-lg font-bold text-korea-blue">{totalDays}</span>
                  <button
                    onClick={() => setTotalDays(Math.min(14, totalDays + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500"
                  >+</button>
                </div>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">步調</label>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value as TripFormData["pace"])}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-korea-blue focus:outline-none"
                >
                  {PACE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">每日開始</label>
                <input
                  type="time"
                  value={dailyStartTime}
                  onChange={(e) => setDailyStartTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-korea-blue focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">每日結束</label>
                <input
                  type="time"
                  value={dailyEndTime}
                  onChange={(e) => setDailyEndTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-korea-blue focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-400">飯店 / 住宿名稱</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="例：明洞九樹高級飯店"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-300 focus:border-korea-blue focus:outline-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !startDate || !hotelName}
              className="mt-2 w-full rounded-xl bg-korea-blue py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {loading ? "🤖 AI 排程中..." : "✨ 開始規劃"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
