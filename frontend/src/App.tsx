import { useState } from "react";
import { TripPlan, TripFormData, ApiResponse } from "./types";
import { TripForm } from "./components/TripForm";
import { ItineraryView } from "./components/ItineraryView";
import { planTrip } from "./api/planTrip";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (data: TripFormData) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    setHasSearched(true);

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

  return (
    <div className="min-h-screen">
      <header className="bg-korea-blue text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <span className="text-3xl">🇰🇷</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Korea Trip Planner</h1>
            <p className="text-sm text-blue-200">韓國旅遊智慧排程系統</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <aside>
            <TripForm onSubmit={handleSubmit} loading={loading} />
          </aside>

          <section>
            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-korea-blue border-t-transparent" />
                <p className="mt-6 text-lg font-medium text-gray-600">
                  🤖 Agnes AI 正在為您智慧排程...
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  正在分析景點地理、公休日、交通路線與預約資訊
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-red-800">排程失敗</h3>
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && plan && <ItineraryView plan={plan} />}

            {!loading && !error && !plan && !hasSearched && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-6xl">🗺️</span>
                <h2 className="mt-6 text-2xl font-bold text-gray-700">
                  開始規劃你的韓國之旅
                </h2>
                <p className="mt-2 max-w-md text-gray-500">
                  在左側輸入你的旅行偏好，Agnes AI 將為你打造每日最佳路線、估算交通費用，並自動檢查公休日與預約資訊。
                </p>
              </div>
            )}

            {!loading && !error && !plan && hasSearched && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-6xl">🔍</span>
                <p className="mt-4 text-gray-500">請輸入行程資料後開始排程</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        Korea Trip Planner &middot; Powered by Agnes AI (agnes-2.0-flash)
      </footer>
    </div>
  );
}
