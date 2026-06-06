import { useState } from "react";
import { TripPlan, TripFormData, ApiResponse } from "./types";
import { TripForm } from "./components/TripForm";
import { ItineraryView } from "./components/ItineraryView";
import { planTrip } from "./api/planTrip";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [activeTab, setActiveTab] = useState<"itinerary" | "settings">(
    "itinerary"
  );

  const handleSubmit = async (data: TripFormData) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    setShowForm(false);
    setActiveTab("itinerary");

    try {
      const res: ApiResponse = await planTrip(data);
      if (res.success && res.data) {
        setPlan(res.data);
      } else {
        setError(res.error || "排程失敗，請稍後再試");
      }
    } catch (e: any) {
      setError(e.message || "網路錯誤，無法連線到排程服務");
    } finally {
      setLoading(false);
    }
  };

  const hasPlan = !!plan;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-gray-50">
      <header className="sticky top-0 z-30 bg-korea-blue text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🇰🇷</span>
            <div>
              <h1 className="text-base font-bold tracking-tight">
                Korea Trip Planner
              </h1>
              <p className="text-[11px] text-blue-200">韓國旅遊智慧排程</p>
            </div>
          </div>
          {hasPlan && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white active:bg-white/25"
            >
              {showForm ? "✕ 關閉" : "⚙️ 設定"}
            </button>
          )}
        </div>
      </header>

      {showForm && (
        <div className="border-b border-gray-200 bg-white px-4 pb-4 pt-3 shadow-sm">
          <TripForm onSubmit={handleSubmit} loading={loading} />
        </div>
      )}

      <main className="flex-1 px-4 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-korea-blue border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-gray-600">
              🤖 Agnes AI 正在為您智慧排程...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-800">排程失敗</p>
                <p className="mt-0.5 text-xs text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && plan && <ItineraryView plan={plan} />}

        {!loading && !error && !plan && !showForm && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl">🗺️</span>
            <p className="mt-3 text-sm text-gray-500">
              㩒右上角「設定」開始規劃行程
            </p>
          </div>
        )}

        {!loading && !error && !plan && showForm && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl">🇰🇷</span>
            <h2 className="mt-4 text-lg font-bold text-gray-700">
              開始規劃你的韓國之旅
            </h2>
            <p className="mt-1 max-w-xs text-xs text-gray-400">
              輸入景點、日期與住宿，AI 自動幫你排好每日路線
            </p>
          </div>
        )}
      </main>

      {hasPlan && (
        <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white shadow-2xl">
          <div className="mx-auto flex max-w-lg">
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                activeTab === "itinerary"
                  ? "text-korea-blue"
                  : "text-gray-400"
              }`}
            >
              <span className="text-lg">📋</span>
              行程
            </button>
            <button
              onClick={() => {
                setActiveTab("settings");
                setShowForm(true);
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                activeTab === "settings" ? "text-korea-blue" : "text-gray-400"
              }`}
            >
              <span className="text-lg">✏️</span>
             編排
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
