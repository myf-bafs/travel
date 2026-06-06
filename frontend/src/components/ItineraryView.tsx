import { useState, useCallback } from "react";
import { TripPlan, ScheduleItem, DayPlan } from "../types";
import { TripMap } from "./TripMap";

interface Props {
  plan: TripPlan;
}

const costColor = (cost: number) => {
  if (cost === 0) return "text-gray-400";
  if (cost < 5000) return "text-green-600";
  if (cost < 15000) return "text-yellow-600";
  return "text-red-600";
};

type EditableTripPlan = TripPlan;

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function ItineraryView({ plan: initialPlan }: Props) {
  const [plan, setPlan] = useState<EditableTripPlan>(() =>
    deepClone(initialPlan)
  );
  const [editDays, setEditDays] = useState<Record<string, boolean>>({});
  const [editingTime, setEditingTime] = useState<{
    dayKey: string;
    idx: number;
  } | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});

  const dayKeys = Object.keys(plan.itinerary).sort((a, b) => {
    return parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""));
  });

  const toggleEditDay = (key: string) => {
    setEditDays((prev) => ({ ...prev, [key]: !prev[key] }));
    setEditingTime(null);
  };

  const moveItem = (dayKey: string, fromIdx: number, toIdx: number) => {
    setPlan((prev) => {
      const next = deepClone(prev);
      const items = next.itinerary[dayKey].schedule;
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return next;
    });
  };

  const updateTime = (dayKey: string, idx: number, val: string) => {
    setPlan((prev) => {
      const next = deepClone(prev);
      next.itinerary[dayKey].schedule[idx].time_slots = val;
      return next;
    });
  };

  const updateNote = (dayKey: string, idx: number, val: string) => {
    setEditNotes((prev) => ({ ...prev, [`${dayKey}-${idx}`]: val }));
  };

  return (
    <div className="space-y-4 pb-4">
      <TripMap plan={plan} />

      <div className="rounded-2xl bg-gradient-to-br from-korea-blue to-blue-900 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-200">總交通費</p>
            <p
              className={`text-2xl font-bold ${costColor(
                plan.trip_summary.estimated_total_transit_cost_krw
              )}`}
            >
              ₩{plan.trip_summary.estimated_total_transit_cost_krw.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">
              {plan.trip_summary.total_days} 天旅程
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-white/10 p-3">
          <p className="text-xs leading-relaxed">
            {plan.trip_summary.general_recommendations}
          </p>
        </div>
      </div>

      {dayKeys.map((dayKey, dayIdx) => {
        const day = plan.itinerary[dayKey];
        const dayNumber = dayIdx + 1;
        const dayOfWeek = getDayOfWeek(day.date);
        const isEditing = editDays[dayKey] || false;

        return (
          <div
            key={dayKey}
            className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-200"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-korea-blue text-sm font-bold text-white shadow-sm">
                  {dayNumber}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    第 {dayNumber} 天
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {day.date}（{dayOfWeek}）
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${costColor(
                    day.daily_transit_cost_krw
                  )}`}
                >
                  ₩{day.daily_transit_cost_krw.toLocaleString()}
                </span>
                <button
                  onClick={() => toggleEditDay(dayKey)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    isEditing
                      ? "bg-korea-blue text-white"
                      : "bg-gray-100 text-gray-500 active:bg-gray-200"
                  }`}
                >
                  {isEditing ? "完成" : "編輯"}
                </button>
              </div>
            </div>

            <div className="px-5 py-3">
              {day.schedule.map((item, idx) => (
                <div key={idx} className="relative pb-4 last:pb-0">
                  {isEditing && (
                    <div className="absolute -left-1 top-0 z-10 flex flex-col gap-0.5">
                      <button
                        onClick={() =>
                          idx > 0 && moveItem(dayKey, idx, idx - 1)
                        }
                        disabled={idx === 0}
                        className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-gray-400 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() =>
                          idx < day.schedule.length - 1 &&
                          moveItem(dayKey, idx, idx + 1)
                        }
                        disabled={idx === day.schedule.length - 1}
                        className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-gray-400 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                  )}

                  {!isEditing && (
                    <>
                      <div className="timeline-dot bg-korea-blue" />
                      {idx < day.schedule.length - 1 && (
                        <div className="timeline-line bg-gray-200" />
                      )}
                    </>
                  )}

                  <div className={`${isEditing ? "" : "ml-8"}`}>
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] text-korea-blue">
                            🕐
                          </span>
                          <input
                            value={item.time_slots}
                            onChange={(e) =>
                              updateTime(dayKey, idx, e.target.value)
                            }
                            className="w-28 rounded border border-gray-300 px-1.5 py-0.5 text-xs focus:border-korea-blue focus:outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-korea-blue">
                            🕐 {item.time_slots}
                          </span>
                          {item.estimated_stay_mins > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                              ⏱ {Math.floor(item.estimated_stay_mins / 60)}h
                              {item.estimated_stay_mins % 60}m
                            </span>
                          )}
                          {item.is_reservation_required && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                              📅 需預約
                            </span>
                          )}
                        </>
                      )}
                      {isEditing && item.is_reservation_required && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                          📅 需預約
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-gray-800">
                      {item.spot_name}
                      {item.korean_name && (
                        <span className="ml-1.5 font-normal text-gray-400">
                          {item.korean_name}
                        </span>
                      )}
                    </p>

                    {isEditing && (
                      <div className="mt-1.5">
                        <textarea
                          placeholder="個人備註..."
                          value={editNotes[`${dayKey}-${idx}`] || ""}
                          onChange={(e) =>
                            updateNote(dayKey, idx, e.target.value)
                          }
                          rows={2}
                          className="w-full resize-none rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs placeholder-gray-300 focus:border-korea-blue focus:outline-none"
                        />
                      </div>
                    )}

                    {!isEditing &&
                      item.is_reservation_required &&
                      item.reservation_guide && (
                        <div className="mt-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">
                          <p className="text-[11px] font-medium text-red-700">
                            📅 {item.reservation_guide}
                          </p>
                        </div>
                      )}

                    {!isEditing &&
                      item.notices.length > 0 &&
                      item.notices.map((n, ni) => (
                        <p
                          key={ni}
                          className={`mt-1 flex items-start gap-1 text-[11px] ${
                            n.includes("公休") ||
                            n.includes("注意") ||
                            n.includes("警告")
                              ? "text-red-600"
                              : "text-amber-700"
                          }`}
                        >
                          <span>
                            {n.includes("公休") ||
                            n.includes("注意") ||
                            n.includes("警告")
                              ? "⚠️"
                              : "💡"}
                          </span>
                          {n}
                        </p>
                      ))}

                    {!isEditing &&
                      item.transit_to_next &&
                      idx < day.schedule.length - 1 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
                          <span className="text-xs">
                            {item.transit_to_next.mode === "Subway"
                              ? "🚇"
                              : item.transit_to_next.mode === "Bus"
                              ? "🚌"
                              : item.transit_to_next.mode === "Taxi"
                              ? "🚕"
                              : "🚶"}{" "}
                            {item.transit_to_next.mode}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {item.transit_to_next.duration_mins}分
                          </span>
                          <span
                            className={`text-[11px] font-medium ${costColor(
                              item.transit_to_next.estimated_cost_krw
                            )}`}
                          >
                            ₩
                            {item.transit_to_next.estimated_cost_krw.toLocaleString()}
                          </span>
                          {item.transit_to_next.route_note && (
                            <span className="w-full text-[11px] text-gray-400">
                              {item.transit_to_next.route_note}
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getDayOfWeek(dateStr: string): string {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `週${days[date.getDay()]}`;
}
