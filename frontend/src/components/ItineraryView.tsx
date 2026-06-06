import { useRef, useEffect, useState, useCallback } from "react";
import Sortable from "sortablejs";
import { TripPlan, ScheduleItem, SuggestItem } from "../types";
import { TripMap } from "./TripMap";
import { AiSuggestion } from "./AiSuggestion";
import { ExploreModal } from "./ExploreModal";

interface Props {
  plan: TripPlan;
  destination: string;
  onPlanChange: (plan: TripPlan) => void;
}

const DAY_COLORS_BG = ["bg-blue-500", "bg-red-500", "bg-amber-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-cyan-500"];

const costColor = (cost: number) => {
  if (cost <= 0) return "text-gray-400";
  if (cost < 5000) return "text-green-600";
  if (cost < 15000) return "text-yellow-600";
  return "text-red-600";
};

const modeIcon: Record<string, string> = {
  Subway: "🚇", Bus: "🚌", Taxi: "🚕", Walk: "🚶", KTX: "🚄",
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getDayOfWeek(dateStr: string): string {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const [y, m, d] = dateStr.split("-").map(Number);
  return `週${days[new Date(y, m - 1, d).getDay()]}`;
}

export function ItineraryView({ plan, destination, onPlanChange }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showExplore, setShowExplore] = useState(false);

  const dayKeys = Object.keys(plan.itinerary).sort((a, b) =>
    parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""))
  );

  const activeDayKey = dayKeys[activeDay];
  const activeDayData = plan.itinerary[activeDayKey];

  const handleAddSpot = (spot: string) => {
    if (!activeDayKey) return;
    const updated = deepClone(plan);
    const day = updated.itinerary[activeDayKey];
    day.schedule.push({
      time_slots: "12:00 - 13:00",
      spot_name: spot,
      estimated_stay_mins: 90,
      transit_to_next: { mode: "Walk", duration_mins: 0, estimated_cost_krw: 0 },
    });
    onPlanChange(updated);
  };

  const handleAiImport = (s: SuggestItem) => {
    handleAddSpot(s.spot_name);
  };

  const updateTransitCosts = useCallback((updatedPlan: TripPlan) => {
    for (const key of Object.keys(updatedPlan.itinerary)) {
      const day = updatedPlan.itinerary[key];
      let total = 0;
      for (const item of day.schedule) {
        if (item.transit_to_next) {
          total += item.transit_to_next.estimated_cost_krw || 0;
        }
      }
      day.daily_transit_cost_krw = total;
    }
    updatedPlan.trip_summary.estimated_total_transit_cost_krw =
      Object.values(updatedPlan.itinerary).reduce((s, d) => s + d.daily_transit_cost_krw, 0);
  }, []);

  const handleTimerUpdate = (dayKey: string, idx: number, field: "start" | "end", val: string) => {
    const updated = deepClone(plan);
    const item = updated.itinerary[dayKey].schedule[idx];
    const parts = item.time_slots.split(" - ");
    item.time_slots = field === "start" ? `${val} - ${parts[1] || ""}` : `${parts[0] || ""} - ${val}`;
    updateTransitCosts(updated);
    onPlanChange(updated);
  };

  const handleDragEnd = (updatedSchedule: ScheduleItem[]) => {
    const updated = deepClone(plan);
    updated.itinerary[activeDayKey].schedule = updatedSchedule;
    updateTransitCosts(updated);
    onPlanChange(updated);
  };

  const handleExploreAdd = (spot: string, dayKey: string) => {
    const updated = deepClone(plan);
    const day = updated.itinerary[dayKey];
    day.schedule.push({
      time_slots: "12:00 - 13:00",
      spot_name: spot,
      estimated_stay_mins: 90,
      transit_to_next: { mode: "Walk", duration_mins: 0, estimated_cost_krw: 0 },
    });
    updateTransitCosts(updated);
    onPlanChange(updated);
    // switch to that day
    const idx = dayKeys.indexOf(dayKey);
    if (idx >= 0) setActiveDay(idx);
  };

  if (!activeDayData) return null;

  const allSpots = dayKeys.flatMap((k) => plan.itinerary[k].schedule.map((s) => s.spot_name));

  return (
    <div className="space-y-3 pb-4">
      {/* Map */}
      <TripMap plan={plan} activeDayKey={activeDayKey} />

      {/* Summary card */}
      <div className="rounded-2xl bg-gradient-to-br from-korea-blue to-blue-900 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs text-blue-200">
            <span className="text-lg font-bold text-white">₩{plan.trip_summary.estimated_total_transit_cost_krw.toLocaleString()}</span>
            <p>預估總交通費</p>
          </div>
          <div className="text-right text-xs text-blue-200">
            <span className="text-lg font-bold text-white">{plan.trip_summary.total_days}</span>
            <p>天旅程</p>
          </div>
        </div>
        <div className="mt-2 rounded-xl bg-white/10 p-2.5 text-xs leading-relaxed">
          {plan.trip_summary.general_recommendations}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            editMode ? "bg-korea-blue text-white" : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-200"
          }`}
        >
          {editMode ? "✓ 完成編輯" : "✎ 編輯行程"}
        </button>
        <button
          onClick={() => setShowExplore(true)}
          className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm ring-1 ring-gray-200"
        >
          🔍 探索景點
        </button>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {dayKeys.map((key, i) => (
          <button
            key={key}
            onClick={() => setActiveDay(i)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeDay === i
                ? `${DAY_COLORS_BG[i % DAY_COLORS_BG.length]} text-white shadow`
                : "bg-white text-gray-500 ring-1 ring-gray-200"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
              {i + 1}
            </span>
            {key.replace("day_", "Day ")} · {plan.itinerary[key].schedule.length} 景點
          </button>
        ))}
      </div>

      {/* Active day schedule */}
      <DaySchedule
        dayKey={activeDayKey}
        day={activeDayData}
        dayIdx={activeDay}
        editMode={editMode}
        onTimeUpdate={handleTimerUpdate}
        onDragEnd={handleDragEnd}
      />

      {/* AI Suggestion */}
      <AiSuggestion
        destination={destination}
        dayKey={activeDayKey}
        existingSpots={activeDayData.schedule.map((s) => s.spot_name)}
        onImport={handleAiImport}
      />

      {/* Explore modal */}
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

function DaySchedule({
  dayKey, day, dayIdx, editMode, onTimeUpdate, onDragEnd,
}: {
  dayKey: string;
  day: import("../types").DayPlan;
  dayIdx: number;
  editMode: boolean;
  onTimeUpdate: (dayKey: string, idx: number, field: "start" | "end", val: string) => void;
  onDragEnd: (schedule: import("../types").ScheduleItem[]) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current || !editMode) return;
    const sortable = Sortable.create(listRef.current, {
      handle: ".drag-handle",
      animation: 200,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      onEnd: (evt) => {
        const items = Array.from(listRef.current!.children).map((el) => {
          const idx = parseInt(el.getAttribute("data-idx") || "0", 10);
          return day.schedule[idx];
        });
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const reordered = [...day.schedule];
          const [moved] = reordered.splice(evt.oldIndex, 1);
          reordered.splice(evt.newIndex, 0, moved);
          onDragEnd(reordered);
        }
      },
    });
    return () => sortable.destroy();
  }, [editMode, day.schedule]);

  if (day.schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-12 shadow-sm ring-1 ring-gray-100">
        <p className="text-3xl">📭</p>
        <p className="mt-2 text-sm text-gray-400">尚未安排行程</p>
        <p className="text-xs text-gray-300 mt-1">點擊「探索景點」加入景點</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div ref={listRef} className="divide-y divide-gray-50">
        {day.schedule.map((item, idx) => {
          const [start, end] = item.time_slots.split(" - ");
          return (
            <div
              key={idx}
              data-idx={idx}
              className={`flex items-stretch gap-2 px-4 py-3 transition ${editMode ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
              {/* Drag handle */}
              {editMode && (
                <div className="drag-handle flex items-center text-gray-300">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="5" cy="3" r="1.5" />
                    <circle cx="11" cy="3" r="1.5" />
                    <circle cx="5" cy="8" r="1.5" />
                    <circle cx="11" cy="8" r="1.5" />
                    <circle cx="5" cy="13" r="1.5" />
                    <circle cx="11" cy="13" r="1.5" />
                  </svg>
                </div>
              )}

              {/* Time */}
              <div className="flex w-14 shrink-0 flex-col items-center pt-0.5">
                {editMode ? (
                  <div className="flex flex-col gap-0.5">
                    <input value={start} onChange={(e) => onTimeUpdate(dayKey, idx, "start", e.target.value)}
                      className="w-14 rounded border border-gray-200 px-1 py-0.5 text-center text-[11px] focus:border-korea-blue focus:outline-none" />
                    <span className="text-[10px] text-gray-300">至</span>
                    <input value={end} onChange={(e) => onTimeUpdate(dayKey, idx, "end", e.target.value)}
                      className="w-14 rounded border border-gray-200 px-1 py-0.5 text-center text-[11px] focus:border-korea-blue focus:outline-none" />
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-bold text-korea-blue">{start}</span>
                    <span className="my-0.5 h-4 w-px bg-gray-200" />
                    <span className="text-[11px] text-gray-400">{end}</span>
                  </>
                )}
              </div>

              {/* Timeline */}
              {!editMode && (
                <div className="flex flex-col items-center pt-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-korea-blue ring-2 ring-white" />
                  {idx < day.schedule.length - 1 && <div className="mt-0.5 h-full w-0.5 bg-gray-100" />}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{item.spot_name}</p>
                {item.korean_name && <p className="text-[11px] text-gray-400 truncate">{item.korean_name}</p>}

                <div className="mt-1 flex flex-wrap gap-1">
                  {item.estimated_stay_mins > 0 && (
                    <span className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500">
                      ⏱ {Math.floor(item.estimated_stay_mins / 60)}h{item.estimated_stay_mins % 60}m
                    </span>
                  )}
                  {item.is_reservation_required && (
                    <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">📅 需預約</span>
                  )}
                </div>

                {!editMode && item.notices && item.notices.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {item.notices.map((n, ni) => (
                      <p key={ni} className={`flex items-start gap-1 text-[11px] ${n.includes("公休") || n.includes("注意") || n.includes("警告") ? "text-red-500" : "text-amber-600"}`}>
                        <span className="shrink-0">{n.includes("公休") || n.includes("注意") || n.includes("警告") ? "⚠️" : "💡"}</span>
                        {n}
                      </p>
                    ))}
                  </div>
                )}

                {!editMode && item.is_reservation_required && item.reservation_guide && (
                  <div className="mt-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5">
                    <p className="text-[11px] text-red-700">📅 {item.reservation_guide}</p>
                  </div>
                )}

                {!editMode && item.transit_to_next && idx < day.schedule.length - 1 && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
                    <span className="text-xs">{modeIcon[item.transit_to_next.mode] || "🚇"} {item.transit_to_next.mode}</span>
                    <span className="text-xs text-gray-400">{item.transit_to_next.duration_mins}分</span>
                    <span className={`text-xs font-medium ${costColor(item.transit_to_next.estimated_cost_krw)}`}>
                      ₩{item.transit_to_next.estimated_cost_krw.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


