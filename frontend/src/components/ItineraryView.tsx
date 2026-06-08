import { useRef, useEffect, useState } from "react";
import Sortable from "sortablejs";
import { TripPlan, ScheduleItem, GlobalSpot, SuggestItem } from "../types";
import { TripMap } from "./TripMap";
import { AiSuggestion } from "./AiSuggestion";
import { ExploreModal } from "./ExploreModal";

interface Props {
  plan: TripPlan;
  destination: string;
  onPlanChange: (plan: TripPlan) => void;
}

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

const costColor = (c: number) =>
  c <= 0 ? "text-gray-400" : c < 5000 ? "text-green-600" : c < 15000 ? "text-yellow-600" : "text-red-600";

const modeIcon: Record<string,string> = { Subway: "🚇", Bus: "🚌", Taxi: "🚕", Walk: "🚶", KTX: "🚄" };

export function ItineraryView({ plan, destination, onPlanChange }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const [showExplore, setShowExplore] = useState(false);

  const dayKeys = Object.keys(plan.itinerary).sort((a, b) =>
    parseInt(a.replace(/\D/g,"")) - parseInt(b.replace(/\D/g,""))
  );
  const activeKey = dayKeys[activeDay];
  const dayData = plan.itinerary[activeKey];

  const updateCosts = (p: TripPlan) => {
    for (const k of Object.keys(p.itinerary)) {
      const d = p.itinerary[k];
      d.daily_transit_cost_krw = d.schedule.reduce((s, i) => s + (i.transit_to_next?.estimated_cost_krw || 0), 0);
    }
    p.trip_summary.estimated_total_transit_cost_krw =
      Object.values(p.itinerary).reduce((s, d) => s + d.daily_transit_cost_krw, 0);
  };

  const handleDrag = (items: ScheduleItem[]) => {
    const p = deepClone(plan);
    p.itinerary[activeKey].schedule = items;
    updateCosts(p);
    onPlanChange(p);
  };

  const handleRemove = (idx: number) => {
    const p = deepClone(plan);
    p.itinerary[activeKey].schedule.splice(idx, 1);
    updateCosts(p);
    onPlanChange(p);
  };

  const handleExploreAdd = (spot: GlobalSpot, key: string) => {
    const p = deepClone(plan);
    p.itinerary[key].schedule.push({
      time_slots: "12:00 - 13:00",
      spot_name: spot.name,
      lat: spot.lat, lng: spot.lng,
      estimated_stay_mins: 90,
      transit_to_next: { mode: "Walk", duration_mins: 0, estimated_cost_krw: 0 },
    });
    updateCosts(p);
    onPlanChange(p);
    const idx = dayKeys.indexOf(key);
    if (idx >= 0) setActiveDay(idx);
    setShowExplore(false);
  };

  const handleAiImport = (s: SuggestItem) => {
    const p = deepClone(plan);
    p.itinerary[activeKey].schedule.push({
      time_slots: "12:00 - 13:00",
      spot_name: s.spot_name,
      estimated_stay_mins: 90,
      transit_to_next: { mode: "Walk", duration_mins: 0, estimated_cost_krw: 0 },
    });
    updateCosts(p);
    onPlanChange(p);
  };

  const allSpots = dayKeys.flatMap(k => plan.itinerary[k].schedule.map(s => s.spot_name));

  return (
    <div className="flex flex-col gap-3 px-4 py-3 pb-6">
      {/* Map */}
      <TripMap plan={plan} activeDayKey={activeKey} />

      {/* Summary */}
      <div className="rounded-xl bg-blue-500 p-3 text-white text-xs">
        <div className="flex justify-between">
          <span>💰 總交通費 ₩{plan.trip_summary.estimated_total_transit_cost_krw.toLocaleString()}</span>
          <span>📅 {plan.trip_summary.total_days}天</span>
        </div>
        <p className="mt-1 opacity-80">{plan.trip_summary.general_recommendations}</p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {dayKeys.map((k, i) => (
          <button key={k} onClick={() => setActiveDay(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              i === activeDay ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
            }`}>
            Day {i+1} · {plan.itinerary[k].schedule.length}景點
          </button>
        ))}
        <button onClick={() => setShowExplore(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-500 border border-blue-200 hover:bg-blue-50">
          + 探索
        </button>
      </div>

      {/* Timeline */}
      <DayTimeline schedule={dayData?.schedule || []} onDrag={handleDrag} onRemove={handleRemove} />

      {/* AI Suggestion */}
      {dayData && (
        <AiSuggestion
          destination={destination}
          dayKey={activeKey}
          existingSpots={dayData.schedule.map(s => s.spot_name)}
          onImport={handleAiImport}
        />
      )}

      {/* Modal */}
      {showExplore && (
        <ExploreModal
          destination={destination}
          dayKeys={dayKeys}
          existingSpots={allSpots}
          onAdd={handleExploreAdd}
          onClose={() => setShowExplore(false)}
        />
      )}
    </div>
  );
}

function DayTimeline({ schedule, onDrag, onRemove }: {
  schedule: ScheduleItem[];
  onDrag: (items: ScheduleItem[]) => void;
  onRemove: (idx: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (!ref.current || !edit) return;
    const s = Sortable.create(ref.current, {
      handle: ".drag-handle",
      animation: 200,
      ghostClass: "sortable-ghost",
      onEnd: (e) => {
        if (e.oldIndex !== undefined && e.newIndex !== undefined) {
          const r = [...schedule];
          const [m] = r.splice(e.oldIndex, 1);
          r.splice(e.newIndex, 0, m);
          onDrag(r);
        }
      },
    });
    return () => s.destroy();
  }, [edit, schedule]);

  if (schedule.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        📭 尚未安排行程<br />點擊「探索」加入景點
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button onClick={() => setEdit(!edit)}
          className={`text-xs font-medium px-3 py-1 rounded-full border transition ${
            edit ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-500 border-gray-200"
          }`}>
          {edit ? "✓ 完成" : "✎ 排序"}
        </button>
      </div>
      <div ref={ref} className="space-y-0">
        {schedule.map((item, idx) => (
          <div key={idx} data-idx={idx}
            className={`relative pl-10 pb-4 timeline-line ${idx === schedule.length - 1 ? "last-item" : ""}`}>
            <div className={`absolute left-[13px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow z-10 ${idx === 0 ? "bg-gray-800" : "bg-blue-500"}`} />
            <div className="text-[11px] font-bold text-gray-500 mb-0.5">{item.time_slots?.split(" - ")[0]}</div>
            <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm flex items-start gap-2 group">
              {edit && <span className="drag-handle text-gray-300 text-lg leading-none mt-0.5">⠿</span>}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-gray-800 truncate">{item.spot_name}</p>
                  <button onClick={() => onRemove(idx)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-xs ml-2">✕</button>
                </div>
                {item.korean_name && <p className="text-[11px] text-gray-400">{item.korean_name}</p>}
                {item.notices && item.notices.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.notices.map((n, i) => (
                      <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${n.includes("公休") ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}>{n}</span>
                    ))}
                  </div>
                )}
                {item.transit_to_next && idx < schedule.length - 1 && (
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-400">
                    <span>{modeIcon[item.transit_to_next.mode] || "🚇"} {item.transit_to_next.mode}</span>
                    <span>{item.transit_to_next.duration_mins}分</span>
                    <span className={costColor(item.transit_to_next.estimated_cost_krw)}>₩{item.transit_to_next.estimated_cost_krw.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
