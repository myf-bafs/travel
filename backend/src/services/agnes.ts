import OpenAI from "openai";
import { TripRequest, TripPlan, SuggestRequest, SuggestionItem } from "../types";
import { enrichSpot } from "../data/korea-spots";

export async function generateTripPlan(req: TripRequest): Promise<TripPlan> {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL || "https://apihub.agnes-ai.com/v1";
  const model = process.env.AGNES_MODEL || "agnes-2.0-flash";

  if (!apiKey) throw new Error("AGNES_API_KEY 未設定");

  const client = new OpenAI({ apiKey, baseURL, maxRetries: 0 });

  const spotsText = req.spots.length > 0
    ? `指定景點：${req.spots.join("、")}`
    : `請推薦熱門景點`;

  const userMsg = `目的地：${req.destination}
${req.startDate} ${req.totalDays}天 ${req.dailyStartTime}-${req.dailyEndTime}
飯店：${req.hotelName}  步調：${req.pace}
${spotsText}

輸出 JSON：{"trip_summary":{"total_days":${req.totalDays},"estimated_total_transit_cost_krw":0,"general_recommendations":"建議"},"itinerary":{"day_1":{"date":"${req.startDate}","daily_transit_cost_krw":0,"schedule":[{"time_slots":"10:00-12:00","spot_name":"景點名","estimated_stay_mins":120,"transit_to_next":{"mode":"Subway","duration_mins":20,"estimated_cost_krw":0}}]}}}}`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "你是旅遊規劃師。輸出純 JSON，每日3-5景點，含交通方式與費用（當地貨幣）。" },
      { role: "user", content: userMsg },
    ],
    temperature: 0.1,
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI 回傳內容為空");

  let plan: TripPlan;
  try {
    plan = JSON.parse(content);
  } catch {
    throw new Error(`AI 回傳非合法 JSON：${content.slice(0, 200)}`);
  }

  for (const key of Object.keys(plan.itinerary)) {
    const day = plan.itinerary[key];
    day.schedule = day.schedule.map((item) => {
      const enriched = enrichSpot(item.spot_name, item);
      if (enriched.notices === undefined) enriched.notices = [];
      if (enriched.is_reservation_required === undefined) enriched.is_reservation_required = false;
      if (enriched.reservation_guide === undefined) enriched.reservation_guide = "";
      if (enriched.korean_name === undefined) enriched.korean_name = "";
      return enriched;
    });
  }

  return plan;
}

export async function suggestSpots(req: SuggestRequest): Promise<SuggestionItem[]> {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL || "https://apihub.agnes-ai.com/v1";
  const model = process.env.AGNES_MODEL || "agnes-2.0-flash";

  if (!apiKey) return [];

  const client = new OpenAI({ apiKey, baseURL, maxRetries: 0 });

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "推薦2-3個順路景點" },
        { role: "user", content: `目的地：${req.destination}\n第${req.dayKey.replace("day_","")}天已排：${req.existingSpots.join("、")}\n\n[{"spot_name":"景點","reason":"理由"}]` },
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const content = response.choices[0]?.message?.content;
    return content ? JSON.parse(content) : [];
  } catch {
    return [];
  }
}
