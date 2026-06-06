import { useState } from "react";
import { TripFormData, POPULAR_SPOTS, PACE_OPTIONS } from "../types";

interface Props {
  onSubmit: (data: TripFormData) => void;
  loading: boolean;
}

export function TripForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<TripFormData>({
    startDate: "",
    totalDays: 3,
    dailyStartTime: "09:00",
    dailyEndTime: "20:00",
    hotelName: "",
    spots: [],
    pace: "一般",
  });
  const [query, setQuery] = useState("");
  const [showSpotPicker, setShowSpotPicker] = useState(false);

  const filteredSpots = POPULAR_SPOTS.filter(
    (s) => s.includes(query) && !form.spots.includes(s)
  );

  const toggleSpot = (spot: string) => {
    setForm((f) => ({
      ...f,
      spots: f.spots.includes(spot)
        ? f.spots.filter((s) => s !== spot)
        : [...f.spots, spot],
    }));
  };

  const removeSpot = (spot: string) => {
    setForm((f) => ({ ...f, spots: f.spots.filter((s) => s !== spot) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || form.spots.length === 0 || !form.hotelName) return;
    onSubmit(form);
  };

  const isValid = form.startDate && form.spots.length > 0 && form.hotelName;

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky top-8 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200"
    >
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800">
        <span className="text-xl">✏️</span> 行程設定
      </h2>

      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            📅 出發日期
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none focus:ring-2 focus:ring-korea-blue/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            📆 旅遊天數
          </label>
          <input
            type="number"
            min={1}
            max={14}
            value={form.totalDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, totalDays: Math.max(1, Math.min(14, +e.target.value)) }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none focus:ring-2 focus:ring-korea-blue/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              🕐 每日開始
            </label>
            <input
              type="time"
              value={form.dailyStartTime}
              onChange={(e) => setForm((f) => ({ ...f, dailyStartTime: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none focus:ring-2 focus:ring-korea-blue/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              🕐 每日結束
            </label>
            <input
              type="time"
              value={form.dailyEndTime}
              onChange={(e) => setForm((f) => ({ ...f, dailyEndTime: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none focus:ring-2 focus:ring-korea-blue/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            🏨 飯店 / 每日起訖點
          </label>
          <input
            type="text"
            value={form.hotelName}
            onChange={(e) => setForm((f) => ({ ...f, hotelName: e.target.value }))}
            placeholder="例：明洞九樹飯店 (Nine Tree Hotel)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none focus:ring-2 focus:ring-korea-blue/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            🏃 旅行步調
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PACE_OPTIONS.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => setForm((f) => ({ ...f, pace: p.value }))}
                className={`rounded-lg border px-3 py-2 text-center text-xs transition ${
                  form.pace === p.value
                    ? "border-korea-blue bg-korea-blue text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">{p.label}</div>
                <div className="mt-0.5 opacity-70">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            🎯 景點願望清單
          </label>

          {form.spots.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {form.spots.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-korea-blue"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSpot(s)}
                    className="ml-0.5 text-blue-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSpotPicker(true);
              }}
              onFocus={() => setShowSpotPicker(true)}
              placeholder="輸入景點名稱，按 Enter 加入（可自由輸入任何景點）"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-korea-blue focus:outline-none focus:ring-2 focus:ring-korea-blue/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (query.trim()) {
                    toggleSpot(query.trim());
                    setQuery("");
                    setShowSpotPicker(false);
                  }
                }
              }}
            />
            {showSpotPicker && (query || filteredSpots.length > 0) && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {filteredSpots.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      toggleSpot(s);
                      setQuery("");
                      setShowSpotPicker(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                  >
                    {s}
                  </button>
                ))}
                {query && !POPULAR_SPOTS.includes(query) && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleSpot(query.trim());
                      setQuery("");
                      setShowSpotPicker(false);
                    }}
                    className="w-full border-t border-dashed border-gray-200 px-3 py-2 text-left text-sm font-medium text-korea-blue hover:bg-blue-50"
                  >
                    ✏️ 新增「{query.trim()}」
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {form.spots.length === 0 ? (
              <p className="text-xs text-gray-400">
                輸入任何韓國景點名稱後按 Enter 或點選新增
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                已加入 {form.spots.length} 個景點
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className={`w-full rounded-xl py-3 text-sm font-bold transition ${
            isValid && !loading
              ? "bg-korea-blue text-white shadow-md hover:bg-blue-800 active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          {loading ? "🤖 AI 排程中..." : "🚀 開始 AI 智慧排程"}
        </button>
      </div>
    </form>
  );
}
