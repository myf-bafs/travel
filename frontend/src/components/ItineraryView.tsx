import { TripPlan } from "../types";

interface Props {
  plan: TripPlan;
}

const costColor = (cost: number) => {
  if (cost === 0) return "text-gray-400";
  if (cost < 5000) return "text-green-600";
  if (cost < 15000) return "text-yellow-600";
  return "text-red-600";
};

export function ItineraryView({ plan }: Props) {
  const { trip_summary, itinerary } = plan;
  const dayKeys = Object.keys(itinerary).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ""), 10);
    const nb = parseInt(b.replace(/\D/g, ""), 10);
    return na - nb;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-korea-blue to-blue-900 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">📋 行程總覽</h2>
            <p className="mt-1 text-sm text-blue-200">
              {trip_summary.total_days} 天旅程
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">預估總交通費</p>
            <p className={`text-2xl font-bold ${costColor(trip_summary.estimated_total_transit_cost_krw)}`}>
              ₩{trip_summary.estimated_total_transit_cost_krw.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white/10 p-4">
          <p className="text-sm leading-relaxed">
            {trip_summary.general_recommendations}
          </p>
        </div>
      </div>

      {dayKeys.map((dayKey, dayIdx) => {
        const day = itinerary[dayKey];
        const dayNumber = dayIdx + 1;
        const dayOfWeek = getDayOfWeek(day.date);

        return (
          <div key={dayKey} className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-korea-blue text-lg font-bold text-white shadow-md">
                  {dayNumber}
                </span>
                <div>
                  <h3 className="font-bold text-gray-800">第 {dayNumber} 天</h3>
                  <p className="text-xs text-gray-400">
                    {day.date}（{dayOfWeek}）
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">本日交通費</p>
                <p className={`text-lg font-bold ${costColor(day.daily_transit_cost_krw)}`}>
                  ₩{day.daily_transit_cost_krw.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="relative px-6 py-4">
              {day.schedule.map((item, idx) => (
                <div key={idx} className="relative pb-6 last:pb-0">
                  <div className="timeline-dot bg-korea-blue" />
                  {idx < day.schedule.length - 1 && (
                    <div className="timeline-line bg-gray-200" />
                  )}

                  <div className="ml-8">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-korea-blue">
                        🕐 {item.time_slots}
                      </span>
                      {item.estimated_stay_mins > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                          ⏱ {Math.floor(item.estimated_stay_mins / 60)}h{item.estimated_stay_mins % 60}m
                        </span>
                      )}
                      {item.is_reservation_required && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                          📅 需預約
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-gray-800">
                      {item.spot_name}
                      {item.korean_name && (
                        <span className="ml-2 font-normal text-gray-400">
                          {item.korean_name}
                        </span>
                      )}
                    </h4>

                    {item.is_reservation_required && item.reservation_guide && (
                      <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                        <p className="text-xs font-medium text-red-700">
                          📅 預約提醒：{item.reservation_guide}
                        </p>
                      </div>
                    )}

                    {item.notices.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.notices.map((n, ni) => (
                          <p
                            key={ni}
                            className={`flex items-start gap-1.5 text-xs ${
                              n.includes("公休") || n.includes("注意") || n.includes("警告")
                                ? "text-red-600"
                                : "text-amber-700"
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {n.includes("公休") || n.includes("注意") || n.includes("警告") ? "⚠️" : "💡"}
                            </span>
                            {n}
                          </p>
                        ))}
                      </div>
                    )}

                    {item.transit_to_next && idx < day.schedule.length - 1 && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                          <span className="text-base">
                            {item.transit_to_next.mode === "Subway"
                              ? "🚇"
                              : item.transit_to_next.mode === "Bus"
                              ? "🚌"
                              : item.transit_to_next.mode === "Taxi"
                              ? "🚕"
                              : "🚶"}
                          </span>
                          {item.transit_to_next.mode}
                        </span>
                        <span className="text-xs text-gray-400">
                          ⏱ {item.transit_to_next.duration_mins} 分鐘
                        </span>
                        <span className={`text-xs font-medium ${costColor(item.transit_to_next.estimated_cost_krw)}`}>
                          ₩{item.transit_to_next.estimated_cost_krw.toLocaleString()}
                        </span>
                        {item.transit_to_next.route_note && (
                          <span className="text-xs text-gray-400">
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
