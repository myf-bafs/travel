import OpenAI from "openai";
import { TripRequest, TripPlan, SuggestRequest, SuggestionItem } from "../types";
import { enrichSpot } from "../data/korea-spots";

const SYSTEM_PROMPT = `你是一位旅遊行程規劃專家。根據使用者輸入，輸出精簡 JSON 行程。

規則：
1. 景點順序應符合地理位置由遠到近或順路排列
2. 預估交通方式與當地基本交通費用
3. 輸出只包含純 JSON，不包含其他文字`;

function buildUserPrompt(req: TripRequest): string {
  const dayStubs = Array.from({ length: req.totalDays }, (_, i) => {
    const d = new Date(req.startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    return `"day_${i + 1}":{"date":"${dateStr}","daily_transit_cost_krw":0,"schedule":[{"time_slots":"09:00-11:00","spot_name":"景點","estimated_stay_mins":120,"transit_to_next":{"mode":"Subway","duration_mins":20,"estimated_cost_krw":0}}]}`;
  }).join(",");

  return `【輸入】
目的地：${req.destination}
${req.startDate} ${req.totalDays}天 ${req.dailyStartTime}-${req.dailyEndTime}
飯店：${req.hotelName}  步調：${req.pace}
景點：${req.spots.join("、")}

【JSON】
{"trip_summary":{"total_days":${req.totalDays},"estimated_total_transit_cost_krw":0,"general_recommendations":"一句話建議"},"itinerary":{${dayStubs}}}`;
}

export async function generateTripPlan(req: TripRequest): Promise<TripPlan> {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL || "https://apihub.agnes-ai.com/v1";
  const model = process.env.AGNES_MODEL || "agnes-2.0-flash";

  if (!apiKey) throw new Error("AGNES_API_KEY 未設定");

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

const SUGGEST_SYSTEM = `你是一位旅遊達人。根據使用者的行程，推薦 2-3 個順路又值得加入的景點。`;

export async function suggestSpots(req: SuggestRequest): Promise<SuggestionItem[]> {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL || "https://apihub.agnes-ai.com/v1";
  const model = process.env.AGNES_MODEL || "agnes-2.0-flash";

  if (!apiKey) return [];

  const client = new OpenAI({ apiKey, baseURL, maxRetries: 0 });

  const prompt = `目的地：${req.destination}
第 ${req.dayKey.replace("day_", "")} 天已排景點：${req.existingSpots.join("、")}

推薦 2-3 個順路景點，請輸出純 JSON 陣列，格式：
[{"spot_name":"景點名稱","reason":"推薦理由"}]`;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SUGGEST_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    return JSON.parse(content);
  } catch {
    return [];
  }
}
