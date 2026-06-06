import { useState } from "react";
import { TripPlan, TripFormData, ApiResponse } from "./types";
import { TripForm } from "./components/TripForm";
import { ItineraryView } from "./components/ItineraryView";
import { CreateTripModal } from "./components/CreateTripModal";
import { planTrip } from "./api/planTrip";

export default function App() {
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [formData, setFormData] = useState<TripFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleCreate = async (data: TripFormData) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    setFormData(data);
    setShowCreate(false);
    setShowSettings(false);

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

  const handlePlanChange = (updated: TripPlan) => {
    setPlan(updated);
  };

  const handleResubmit = async (data: TripFormData) => {
    setFormData(data);
    await handleCreate(data);
  };

  const hasPlan = !!plan;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-korea-blue text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2.5 active:opacity-80">
            <span className="text-2xl">🌍</span>
            <div>
              <h1 className="text-base font-bold tracking-tight">Trip Planner</h1>
              <p className="text-[11px] text-blue-200">AI 旅遊智慧排程</p>
            </div>
          </button>
          {hasPlan && (
            <div className="flex items-center gap-2">
              {formData && (
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-blue-200">
                  {formData.destination} · {formData.totalDays}天
                </span>
              )}
              <button
                onClick={() => setShowSettings((v) => !v)}
                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white active:bg-white/25"
              >
                {showSettings ? "✕ 關閉" : "⚙️"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Settings panel */}
      {showSettings && formData && (
        <div className="border-b border-gray-200 bg-white px-4 pb-4 pt-3 shadow-sm">
          <TripForm initial={formData} onSubmit={handleResubmit} loading={loading} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-4">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-korea-blue border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-gray-600">🤖 Agnes AI 正在為您智慧排程...</p>
            <p className="mt-1 text-xs text-gray-400">{formData?.destination} · {formData?.spots.length} 個景點</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-800">排程失敗</p>
                <p className="mt-0.5 text-xs text-red-600">{error}</p>
              </div>
            </div>
            <button onClick={() => setShowCreate(true)} className="mt-3 rounded-xl bg-korea-blue px-4 py-2 text-xs font-bold text-white">
              🔄 重新規劃
            </button>
          </div>
        )}

        {/* Plan */}
        {!loading && !error && plan && formData && (
          <ItineraryView
            plan={plan}
            destination={formData.destination}
            onPlanChange={handlePlanChange}
          />
        )}

        {/* Empty state */}
        {!loading && !error && !plan && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🗺️</span>
            <h2 className="text-lg font-bold text-gray-700">開始你的旅程</h2>
            <p className="mt-1 max-w-xs text-xs text-gray-400">點擊左上角標題或下方按鈕，建立新旅程</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 rounded-xl bg-korea-blue px-6 py-3 text-sm font-bold text-white shadow-lg"
            >
              ✨ 建立新旅程
            </button>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      {hasPlan && (
        <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white shadow-2xl">
          <div className="mx-auto flex max-w-lg">
            <button
              onClick={() => setShowSettings(false)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-korea-blue"
            >
              <span className="text-lg">📋</span>行程
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-gray-400"
            >
              <span className="text-lg">✏️</span>編排
            </button>
          </div>
        </div>
      )}

      {/* Create trip modal */}
      {showCreate && (
        <CreateTripModal
          onSubmit={handleCreate}
          loading={loading}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
