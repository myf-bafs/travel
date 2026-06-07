import { useState, useEffect } from "react";
import { TripPlan, TripFormData, ApiResponse, GlobalSpot } from "./types";
import { ItineraryView } from "./components/ItineraryView";
import { CreateTripModal } from "./components/CreateTripModal";
import { planTrip } from "./api/planTrip";
import { CalendarBlank, MagnifyingGlass, MagicWand, CaretDown, AirplaneTilt } from "@phosphor-icons/react";

export default function App() {
  const [showCreate, setShowCreate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
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
      const formData: TripFormData = {
        destination: data.destination,
        startDate: data.startDate,
        totalDays: data.totalDays,
        dailyStartTime: "09:00",
        dailyEndTime: "21:00",
        hotelName: "市中心飯店",
        spots: [],
        pace: "一般",
      };
      const res: ApiResponse = await planTrip(formData);
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

  const handleRegenerate = async () => {
    if (!destination || !startDate || !plan) return;
    setRegenerating(true);
    setError(null);

    try {
      const dayKeys = Object.keys(plan.itinerary).sort((a, b) =>
        parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""))
      );
      const allSpots = dayKeys.flatMap((k) => plan.itinerary[k].schedule.map((s) => s.spot_name));
      const formData: TripFormData = {
        destination,
        startDate,
        totalDays: dayKeys.length,
        dailyStartTime: "09:00",
        dailyEndTime: "21:00",
        hotelName: "市中心飯店",
        spots: allSpots,
        pace: "一般",
      };
      const res: ApiResponse = await planTrip(formData);
      if (res.success && res.data) {
        setPlan(res.data);
      } else {
        setError(res.error || "排程失敗");
      }
    } catch (e: any) {
      setError(e.message || "網路錯誤");
    } finally {
      setRegenerating(false);
    }
  };

  const handlePlanChange = (updated: TripPlan) => {
    setPlan(updated);
  };

  const hasPlan = !!plan;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-gray font-sans text-slate-800">
      {/* Nav */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20 shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition"
          onClick={() => setShowCreate(true)}
        >
          <span className="text-2xl" id="navEmoji">{hasPlan ? "📍" : "🌍"}</span>
          <h1 className="text-lg font-bold tracking-wide text-slate-900 hidden sm:block">
            AgnesTravel <span className="text-sm font-medium text-slate-500 ml-2" id="navDestination">
              {hasPlan ? destination : "建立新旅程..."}
            </span>
          </h1>
          <CaretDown className="text-slate-400" size={16} />
        </div>

        <div
          className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200 cursor-pointer hover:bg-slate-200 transition"
          onClick={() => setShowCreate(true)}
        >
          <CalendarBlank className="text-slate-500" size={18} />
          <span className="text-sm font-medium text-slate-700">
            {hasPlan ? `${startDate} (${Object.keys(plan.itinerary).length}天)` : "請選擇日期"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasPlan && (
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 bg-primary-blue hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-40"
            >
              <MagicWand size={18} weight="fill" />
              <span className="hidden sm:inline">{regenerating ? "AI 規劃中..." : "Agnes AI 智慧編排"}</span>
            </button>
          )}
          {!hasPlan && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-primary-blue hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <AirplaneTilt size={18} weight="fill" />
              <span>開始規劃</span>
            </button>
          )}
        </div>
      </nav>

      {/* Error toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          ⚠️ {error}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <span className="spinner !border-primary-blue !w-8 !h-8" />
            <p className="text-sm font-medium text-slate-600">🤖 Agnes AI 正在為您智慧排程...</p>
            <p className="text-xs text-slate-400">{destination}· 規劃中</p>
          </div>
        </div>
      )}

      {/* Main content */}
      {hasPlan ? (
        <ItineraryView
          plan={plan}
          destination={destination}
          startDate={startDate}
          onPlanChange={handlePlanChange}
          onRegenerate={handleRegenerate}
          regenerating={regenerating}
        />
      ) : !loading ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <AirplaneTilt size={80} weight="thin" className="text-slate-200 mx-auto" />
            <h2 className="text-xl font-bold text-slate-700 mt-4">歡迎使用 AgnesTravel</h2>
            <p className="text-sm text-slate-400 mt-2">點擊上方「開始規劃」建立你的旅程</p>
          </div>
        </div>
      ) : null}

      {/* Create trip modal */}
      {showCreate && (
        <CreateTripModal
          onSubmit={handleCreate}
          loading={loading}
          onClose={() => {
            if (!plan) setShowCreate(false);
            else setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}
