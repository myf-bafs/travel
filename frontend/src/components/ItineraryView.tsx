import { useState } from "react";
import { TripPlan } from "../types";
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

const modeIcon: Record<string, string> = {
  Subway: "🚇",
  Bus: "🚌",
  Taxi: "🚕",
  Walk: "🚶",
  KTX: "🚄",
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function ItineraryView({ plan: initialPlan }: Props) {
  const [plan, setPlan] = useState<TripPlan>(() => deepClone(initialPlan));
  const [editDays, setEditDays] = useState<Record<string, boolean>>({});
  const [dragState, setDragState] = useState<{
    dayKey: string;
    fromIdx: number;
  } | null>(null);

  const dayKeys = Object.keys(plan.itinerary).sort((a, b) => {
    return parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""));
  });

  const toggleEditDay = (key: string) => {
    setEditDays((prev) => ({ ...prev, [key]: !prev[key] }));
    setDragState(null);
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

  const updateTime = (dayKey: string, idx: number, field: string, val: string) => {
    setPlan((prev) => {
      const next = deepClone(prev);
      const item = next.itinerary[dayKey].schedule[idx];
      if (field === "start") {
        const end = item.time_slots.split(" - ")[1] || "";
        item.time_slots = `${val} - ${end}`;
      } else {
        const start = item.time_slots.split(" - ")[0] || "";
        item.time_slots = `${start} - ${val}`;
      }
      return next;
    });
  };

  return (
    <div className="space-y-3 pb-4">
      <TripMap plan={plan} />

      <div className="rounded-2xl bg-gradient-to-br from-korea-blue to-blue-900 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs text-blue-200">
            <span className="text-lg font-bold text-white">
              ₩{plan.trip_summary.estimated_total_transit_cost_krw.toLocaleString()}
            </span>
            <p>預估總交通費</p>
          </div>
          <div className="text-right text-xs text-blue-200">
            <span className="text-lg font-bold text-white">
              {plan.trip_summary.total_days}
            </span>
            <p>天旅程</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-white/10 p-3 text-xs leading-relaxed">
          {plan.trip_summary.general_recommendations}
        </div>
      </div>

      {dayKeys.map((dayKey, dayIdx) => {
        const day = plan.itinerary[dayKey];
        const dayNumber = dayIdx + 1;
        const isEditing = editDays[dayKey] || false;

        return (
          <div
            key={dayKey}
            className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-200"
          >
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                background:
                  "linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-korea-blue text-sm font-bold text-white shadow-sm">
                  {dayNumber}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {day.date}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getDayOfWeek(day.date)} · {day.schedule.length} 個景點
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  ₩{day.daily_transit_cost_krw.toLocaleString()}
                </span>
                <button
                  onClick={() => toggleEditDay(dayKey)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    isEditing
                      ? "bg-korea-blue text-white"
                      : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 active:bg-gray-50"
                  }`}
                >
                  {isEditing ? "✓ 完成" : "✎ 編輯"}
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-50 px-5">
              {day.schedule.map((item, idx) => {
                const [startTime, endTime] = item.time_slots.split(" - ");

                return (
                  <div
                    key={idx}
                    className={`relative flex items-stretch gap-3 py-3.5 transition ${
                      dragState?.dayKey === dayKey &&
                      dragState?.fromIdx === idx
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    {/* Time column */}
                    <div className="flex w-14 shrink-0 flex-col items-center pt-0.5">
                      {isEditing ? (
                        <div className="flex flex-col gap-0.5">
                          <input
                            value={startTime}
                            onChange={(e) =>
                              updateTime(dayKey, idx, "start", e.target.value)
                            }
                            className="w-14 rounded border border-gray-200 px-1 py-0.5 text-center text-[11px] focus:border-korea-blue focus:outline-none"
                          />
                          <span className="text-[10px] text-gray-300">至</span>
                          <input
                            value={endTime}
                            onChange={(e) =>
                              updateTime(dayKey, idx, "end", e.target.value)
                            }
                            className="w-14 rounded border border-gray-200 px-1 py-0.5 text-center text-[11px] focus:border-korea-blue focus:outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-korea-blue">
                            {startTime}
                          </span>
                          <span className="my-0.5 h-4 w-px bg-gray-200" />
                          <span className="text-[11px] text-gray-400">
                            {endTime}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Timeline connector */}
                    {!isEditing && (
                      <div className="flex flex-col items-center pt-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-korea-blue ring-2 ring-white" />
                        {idx < day.schedule.length - 1 && (
                          <div className="mt-0.5 h-full w-0.5 bg-gray-100" />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {item.spot_name}
                          </p>
                          {item.korean_name && (
                            <p className="text-[11px] text-gray-400 truncate">
                              {item.korean_name}
                            </p>
                          )}
                        </div>

                        {/* Edit controls */}
                        {isEditing && (
                          <div className="flex shrink-0 gap-1">
                            <button
                              onClick={() =>
                                idx > 0 && moveItem(dayKey, idx, idx - 1)
                              }
                              disabled={idx === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-400 disabled:opacity-30 active:bg-gray-100"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() =>
                                idx < day.schedule.length - 1 &&
                                moveItem(dayKey, idx, idx + 1)
                              }
                              disabled={idx === day.schedule.length - 1}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-400 disabled:opacity-30 active:bg-gray-100"
                            >
                              ▼
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.estimated_stay_mins > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500">
                            ⏱ {Math.floor(item.estimated_stay_mins / 60)}h
                            {item.estimated_stay_mins % 60}m
                          </span>
                        )}
                        {item.is_reservation_required && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            📅 需預約
                          </span>
                        )}
                      </div>

                      {/* Notices */}
                      {!isEditing && item.notices?.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {item.notices.map((n, ni) => (
                            <p
                              key={ni}
                              className={`flex items-start gap-1 text-[11px] ${
                                n.includes("公休") ||
                                n.includes("注意") ||
                                n.includes("警告")
                                  ? "text-red-500"
                                  : "text-amber-600"
                              }`}
                            >
                              <span className="shrink-0">
                                {n.includes("公休") ||
                                n.includes("注意") ||
                                n.includes("警告")
                                  ? "⚠️"
                                  : "💡"}
                              </span>
                              {n}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Reservation guide */}
                      {!isEditing &&
                        item.is_reservation_required &&
                        item.reservation_guide && (
                          <div className="mt-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5">
                            <p className="text-[11px] text-red-700">
                              📅 {item.reservation_guide}
                            </p>
                          </div>
                        )}

                      {/* Transit info */}
                      {!isEditing &&
                        item.transit_to_next &&
                        idx < day.schedule.length - 1 && (
                          <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
                            <span className="text-xs">
                              {modeIcon[item.transit_to_next.mode] || "🚇"}{" "}
                              {item.transit_to_next.mode}
                            </span>
                            <span className="text-xs text-gray-400">
                              {item.transit_to_next.duration_mins}分
                            </span>
                            <span
                              className={`text-xs font-medium ${costColor(
                                item.transit_to_next.estimated_cost_krw
                              )}`}
                            >
                              ₩
                              {item.transit_to_next.estimated_cost_krw.toLocaleString()}
                            </span>
                          </div>
                        )}

                      {/* Notes in edit mode */}
                      {isEditing && (
                        <div className="mt-2">
                          <input
                            placeholder="個人備註（選填）"
                            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs placeholder-gray-300 focus:border-korea-blue focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add spot button in edit mode */}
            {isEditing && (
              <div className="border-t border-dashed border-gray-200 px-5 py-3">
                <button className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 py-2.5 text-xs text-gray-400 active:bg-gray-50">
                  ＋ 加入景點
                </button>
              </div>
            )}
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
