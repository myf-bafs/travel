import { useRef, useEffect, useState, useCallback } from "react";
import Sortable from "sortablejs";
import { TripPlan, ScheduleItem, SuggestItem, GlobalSpot } from "../types";
import { TripMap } from "./TripMap";
import { AiSuggestion } from "./AiSuggestion";
import { ExploreModal } from "./ExploreModal";
import { DotsSixVertical, Trash, MapPin, MagicWand, MagnifyingGlass, CalendarBlank } from "@phosphor-icons/react";

interface Props {
  plan: TripPlan;
  destination: string;
  startDate: string;
  onPlanChange: (plan: TripPlan) => void;
  onRegenerate: () => void;
  regenerating: boolean;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getDayOfWeek(dateStr: string): string {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const [y, m, d] = dateStr.split("-").map(Number);
  if (y < 100) return "";
  return `週${days[new Date(y, m - 1, d).getDay()]}`;
}

export function ItineraryView({ plan, destination, startDate, onPlanChange, onRegenerate, regenerating }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showExplore, setShowExplore] = useState(false);

  const dayKeys = Object.keys(plan.itinerary).sort((a, b) =>
    parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""))
  );

  const activeDayKey = dayKeys[activeDay];

  const updateTransitCosts = useCallback((updatedPlan: TripPlan) => {
    for (const key of Object.keys(updatedPlan.itinerary)) {
      const day = updatedPlan.itinerary[key];
      let total = 0;
      for (const item of day.schedule) {
        total += item.transit_to_next?.estimated_cost_krw || 0;
      }
      day.daily_transit_cost_krw = total;
    }
    updatedPlan.trip_summary.estimated_total_transit_cost_krw =
      Object.values(updatedPlan.itinerary).reduce((s, d) => s + d.daily_transit_cost_krw, 0);
  }, []);

  const handleDragEnd = (updatedSchedule: ScheduleItem[]) => {
    const updated = deepClone(plan);
    updated.itinerary[activeDayKey].schedule = updatedSchedule;
    updateTransitCosts(updated);
    onPlanChange(updated);
  };

  const handleRemoveSpot = (idx: number) => {
    const updated = deepClone(plan);
    updated.itinerary[activeDayKey].schedule.splice(idx, 1);
    updateTransitCosts(updated);
    onPlanChange(updated);
  };

  const handleExploreAdd = (spot: GlobalSpot, dayKey: string) => {
    const updated = deepClone(plan);
    const day = updated.itinerary[dayKey];
    day.schedule.push({
      time_slots: "12:00 - 13:00",
      spot_name: spot.name,
      lat: spot.lat,
      lng: spot.lng,
      estimated_stay_mins: 90,
      transit_to_next: { mode: "Walk", duration_mins: 0, estimated_cost_krw: 0 },
    });
    updateTransitCosts(updated);
    onPlanChange(updated);
    const idx = dayKeys.indexOf(dayKey);
    if (idx >= 0) setActiveDay(idx);
    setShowExplore(false);
  };

  const handleAiImport = (s: SuggestItem) => {
    const updated = deepClone(plan);
    const day = updated.itinerary[activeDayKey];
    day.schedule.push({
      time_slots: "12:00 - 13:00",
      spot_name: s.spot_name,
      estimated_stay_mins: 90,
      transit_to_next: { mode: "Walk", duration_mins: 0, estimated_cost_krw: 0 },
    });
    updateTransitCosts(updated);
    onPlanChange(updated);
  };

  const allSpots = dayKeys.flatMap((k) => plan.itinerary[k].schedule.map((s) => s.spot_name));

  if (!activeDayKey) return null;

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Left: itinerary panel */}
      <section className="w-full md:w-5/12 lg:w-2/5 bg-white flex flex-col border-r border-slate-200 z-10">
        {/* Day tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-2 pt-2 flex overflow-x-auto hide-scroll shrink-0" id="dayTabs">
          {dayKeys.map((key, i) => {
            const day = plan.itinerary[key];
            const dateLabel = day.date.substring(5);
            const isActive = i === activeDay;
            return (
              <button
                key={key}
                onClick={() => setActiveDay(i)}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-primary-blue text-primary-blue bg-white rounded-t-lg"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-t-lg"
                }`}
              >
                Day {i + 1} <span className="text-xs font-normal ml-1 text-slate-400">{dateLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              📍 {destination} · Day {activeDay + 1}
            </h2>
            <p className="text-xs text-slate-500 mt-1">💡 提示：按住 ⋮⋮ 即可拖拉排序</p>
          </div>
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 bg-primary-blue hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-40"
          >
            <MagicWand size={18} weight="fill" />
            <span>{regenerating ? "AI 規劃中..." : "Agnes AI 智慧編排"}</span>
          </button>
        </div>

        {/* Explore button */}
        <div className="px-4 py-2 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setShowExplore(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm"
          >
            <MagnifyingGlass size={16} />
            <span>探索景點</span>
          </button>
        </div>

        {/* Timeline */}
        <div id="timelineContainer" className="flex-1 overflow-y-auto p-5 relative bg-slate-50/30 pb-20">
          <DayTimeline
            dayKey={activeDayKey}
            day={plan.itinerary[activeDayKey]}
            editMode={editMode}
            onDragEnd={handleDragEnd}
            onRemove={handleRemoveSpot}
          />
        </div>
      </section>

      {/* Right: map */}
      <section className="hidden md:flex md:w-7/12 lg:w-3/5 relative bg-slate-200 z-0 flex-col">
        <div className="flex-1 relative">
          <TripMap plan={plan} activeDayKey={activeDayKey} />

          {/* AI suggestion overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[380px] max-w-[90vw] z-[1000]">
            <AiSuggestion
              destination={destination}
              dayKey={activeDayKey}
              existingSpots={plan.itinerary[activeDayKey]?.schedule.map((s) => s.spot_name) || []}
              onImport={handleAiImport}
            />
          </div>
        </div>
      </section>

      {/* Mobile: inline AI suggestion and map handled by TripMap */}
      {/* Mobile AI suggestion */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <AiSuggestion
          destination={destination}
          dayKey={activeDayKey}
          existingSpots={plan.itinerary[activeDayKey]?.schedule.map((s) => s.spot_name) || []}
          onImport={handleAiImport}
        />
      </div>

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

function DayTimeline({
  dayKey, day, editMode, onDragEnd, onRemove,
}: {
  dayKey: string;
  day: import("../types").DayPlan;
  editMode: boolean;
  onDragEnd: (schedule: import("../types").ScheduleItem[]) => void;
  onRemove: (idx: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    if (editMode) {
      const sortable = Sortable.create(listRef.current, {
        handle: ".drag-handle",
        animation: 200,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        ghostClass: "sortable-ghost",
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            const reordered = [...day.schedule];
            const [moved] = reordered.splice(evt.oldIndex, 1);
            reordered.splice(evt.newIndex, 0, moved);
            onDragEnd(reordered);
          }
        },
      });
      return () => sortable.destroy();
    }
  }, [editMode, day.schedule]);

  if (day.schedule.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-4 pt-10">
        <MapPin size={64} weight="thin" className="text-slate-200" />
        <p className="text-sm">畫布還是空的！<br />點擊上方「探索景點」或讓 AI 幫您編排</p>
      </div>
    );
  }

  return (
    <div ref={listRef}>
      {day.schedule.map((item, idx) => {
        const isLast = idx === day.schedule.length - 1;
        return (
          <div
            key={idx}
            data-idx={idx}
            className={`relative pl-12 pb-6 timeline-line ${isLast ? "last-item" : ""}`}
          >
            <div
              className={`absolute left-[13px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${
                idx === 0 ? "bg-slate-800" : "bg-primary-blue"
              }`}
            />

            <div className="text-xs font-bold text-slate-500 mb-1">{item.time_slots?.split(" - ")[0] || "10:00"}</div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all relative group flex items-start gap-3">
              {/* Drag handle */}
              <div className="drag-handle text-slate-300 hover:text-slate-500 pt-1 shrink-0 px-1 -ml-1">
                <DotsSixVertical size={20} weight="bold" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base mb-0.5 truncate">{item.spot_name}</h3>
                <p className="text-xs text-slate-500 truncate">{item.korean_name || "自訂景點"}</p>

                {item.notices && item.notices.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.notices.map((n, ni) => (
                      <span key={ni} className={`text-[10px] px-1.5 py-0.5 rounded ${n.includes("公休") ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}>
                        {n}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => onRemove(idx)}
                  className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
