import { useState, useRef } from "react";
import { TripFormData, getPopularSpots, PACE_OPTIONS } from "../types";

interface Props {
  initial: TripFormData;
  onSubmit: (data: TripFormData) => void;
  loading: boolean;
}

export function TripForm({ initial, onSubmit, loading }: Props) {
  const [destination] = useState(initial.destination);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [totalDays, setTotalDays] = useState(initial.totalDays);
  const [dailyStartTime, setDailyStartTime] = useState(initial.dailyStartTime);
  const [dailyEndTime, setDailyEndTime] = useState(initial.dailyEndTime);
  const [hotelName, setHotelName] = useState(initial.hotelName);
  const [pace, setPace] = useState(initial.pace);
  const [spots, setSpots] = useState<string[]>(initial.spots);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addSpot = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !spots.includes(trimmed)) {
      setSpots((prev) => [...prev, trimmed]);
    }
    setInput("");
    inputRef.current?.focus();
  };

  const removeSpot = (s: string) => {
    setSpots((prev) => prev.filter((x) => x !== s));
  };

  const handleSubmit = () => {
    if (!hotelName) return;
    onSubmit({
      destination,
      startDate,
      totalDays,
      dailyStartTime,
      dailyEndTime,
      hotelName,
      spots,
      pace,
    });
  };

  const suggested = getPopularSpots(destination).filter((s) => !spots.includes(s));

  return (
    <div className="space-y-3">
      {/* Hotel + dates */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-400">住宿</label>
          <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none" />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs text-gray-400">日期</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none" />
        </div>
      </div>

      {/* Days + pace */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-400">天數</label>
          <select value={totalDays} onChange={(e) => setTotalDays(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n} 天</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-400">步調</label>
          <select value={pace} onChange={(e) => setPace(e.target.value as TripFormData["pace"])}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none">
            {PACE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-400">時間</label>
          <div className="flex items-center gap-1">
            <input type="time" value={dailyStartTime} onChange={(e) => setDailyStartTime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-2 py-2 text-xs focus:border-korea-blue focus:outline-none" />
            <span className="text-xs text-gray-300">~</span>
            <input type="time" value={dailyEndTime} onChange={(e) => setDailyEndTime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-2 py-2 text-xs focus:border-korea-blue focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Spots */}
      <div className="flex flex-wrap gap-1.5">
        {spots.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-lg bg-korea-blue/10 px-2.5 py-1 text-xs font-medium text-korea-blue">
            {s}
            <button onClick={() => removeSpot(s)} className="text-korea-blue/50">✕</button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpot(input))}
          placeholder="輸入景點名稱，Enter 加入" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm placeholder-gray-300 focus:border-korea-blue focus:outline-none" />
        <button onClick={() => addSpot(input)} disabled={!input.trim()}
          className="rounded-xl bg-korea-blue px-4 text-xs font-bold text-white disabled:opacity-40">＋</button>
        <button onClick={handleSubmit} disabled={loading || spots.length === 0 || !hotelName}
          className="rounded-xl bg-korea-blue px-4 text-xs font-bold text-white disabled:opacity-40">
          {loading ? "..." : "AI 排程"}
        </button>
      </div>

      {/* Suggested spots */}
      {suggested.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] text-gray-400 leading-6">熱門：</span>
          {suggested.slice(0, 6).map((s) => (
            <button key={s} onClick={() => addSpot(s)}
              className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[10px] text-gray-500 active:bg-gray-50">
              +{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
