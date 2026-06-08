import { useState } from "react";
import { TripPlan, TripFormData, ApiResponse } from "./types";
import { ItineraryView } from "./components/ItineraryView";
import { CreateTripModal } from "./components/CreateTripModal";
import { planTrip } from "./api/planTrip";

export default function App() {
  const [showCreate, setShowCreate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (data: { destination: string; startDate: string; totalDays: number }) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    setDestination(data.destination);
    setStartDate(data.startDate);
    setShowCreate(false);

    try {
      const body: TripFormData = {
        destination: data.destination,
        startDate: data.startDate,
        totalDays: data.totalDays,
        dailyStartTime: "09:00",
        dailyEndTime: "21:00",
        hotelName: "市中心飯店",
        spots: [],
        pace: "一般",
      };
      const res: ApiResponse = await planTrip(body);
      if (res.success && res.data) {
        setPlan(res.data);
      } else {
        setError(res.error || "排程失敗");
      }
    } catch (e: any) {
      setError(e.message || "網路錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <span className="text-xl">{plan ? "📍" : "🌍"}</span>
            <h1 className="text-base font-bold text-gray-800">
              {plan ? destination : "Trip Planner"}
            </h1>
          </button>
          <div className="flex items-center gap-2">
            {plan && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {startDate} · {Object.keys(plan.itinerary).length}天
              </span>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 active:bg-gray-50"
            >
              {plan ? "新旅程" : "開始規劃"}
            </button>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="spinner !border-primary-blue !w-8 !h-8" />
          <p className="mt-3 text-sm text-gray-500">🤖 AI 排程中...</p>
        </div>
      )}

      {/* Plan */}
      {!loading && plan && (
        <ItineraryView
          plan={plan}
          destination={destination}
          onPlanChange={setPlan}
        />
      )}

      {/* Empty */}
      {!loading && !plan && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl">🗺️</span>
          <h2 className="mt-4 text-lg font-bold text-gray-700">開始你的旅程</h2>
          <p className="mt-1 text-xs text-gray-400">點擊上方「開始規劃」建立新旅程</p>
        </div>
      )}

      {/* Modal */}
      {showCreate && (
        <CreateTripModal
          onSubmit={handleCreate}
          loading={loading}
          onClose={() => plan && setShowCreate(false)}
        />
      )}
    </div>
  );
}
