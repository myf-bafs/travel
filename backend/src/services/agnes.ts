import OpenAI from "openai";
import { TripRequest, TripPlan, ScheduleItem, DayPlan } from "../types";
import { enrichSpot } from "../data/korea-spots";

const SYSTEM_PROMPT = `你是一位韓國自由行專家。根據使用者輸入，輸出精簡 JSON 行程。

規則：
1. 考慮韓國景點公休日（景福宮週二休、美術館週一休等）
2. 景點由近到遠排序
3. 預估交通方式與地鐵基本費用（1,400韓元起）
4. 回傳格式見 user prompt，只回純 JSON`; 

function buildUserPrompt(req: TripRequest): string {
  const dayStubs = Array.from({ length: req.totalDays }, (_, i) => {
    const d = new Date(req.startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    return `"day_${i + 1}":{"date":"${dateStr}","daily_transit_cost_krw":0,"schedule":[{"time_slots":"09:00-11:00","spot_name":"景點","estimated_stay_mins":120,"transit_to_next":{"mode":"Subway","duration_mins":20,"estimated_cost_krw":1400}}]}`;
  }).join(",");

  return `【輸入】
${req.startDate} ${req.totalDays}天 ${req.dailyStartTime}-${req.dailyEndTime}
飯店:${req.hotelName} 步調:${req.pace}
景點:${req.spots.join("、")}

【JSON】
{"trip_summary":{"total_days":${req.totalDays},"estimated_total_transit_cost_krw":0,"general_recommendations":"一句話建議"},"itinerary":{${dayStubs}}}`;
}

export async function generateTripPlan(req: TripRequest): Promise<TripPlan> {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL || "https://apihub.agnes-ai.com/v1";
  const model = process.env.AGNES_MODEL || "agnes-2.0-flash";

  if (!apiKey) {
    throw new Error("AGNES_API_KEY 未設定");
  }

  const client = new OpenAI({ apiKey, baseURL, maxRetries: 0 });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(req) },
    ],
    temperature: 0.1,
    max_tokens: 1536,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI 回傳內容為空");

  let plan: TripPlan;
  try {
    plan = JSON.parse(content);
  } catch {
    throw new Error(`AI 回傳非合法 JSON：${content.slice(0, 200)}`);
  }

  // Enrich with static data & fill defaults
  for (const key of Object.keys(plan.itinerary)) {
    const day = plan.itinerary[key];
    day.schedule = day.schedule.map((item) => {
      const enriched = enrichSpot(item.spot_name, item);
      // Ensure required fields have defaults
      if (enriched.notices === undefined) enriched.notices = [];
      if (enriched.is_reservation_required === undefined) enriched.is_reservation_required = false;
      if (enriched.reservation_guide === undefined) enriched.reservation_guide = "";
      if (enriched.korean_name === undefined) enriched.korean_name = "";
      return enriched;
    });
  }

  return plan;
}
