import OpenAI from "openai";
import { TripRequest, TripPlan } from "../types";

const SYSTEM_PROMPT = `你是一位韓國自由行專家。根據使用者輸入，輸出嚴格 JSON。

規則：
1. 考慮真實公休日（景福宮週二休、美術館週一休）
2. 景點由近到遠排序，不走回頭路
3. 每個景點附上 approximate lat/lng（WGS84）
4. 預估交通方式與費用（地鐵基本1,400韓元）
5. 標記需預約景點並給預約建議
6. 只回純 JSON，不要 markdown 或說明文字`;

function buildUserPrompt(req: TripRequest): string {
  return `【使用者輸入】
出發日:${req.startDate} 天數:${req.totalDays}
活動時間:${req.dailyStartTime}-${req.dailyEndTime}
飯店:${req.hotelName}
景點:${req.spots.join("、")}
步調:${req.pace}

【JSON 格式】
{
  "trip_summary": { "total_days": ${req.totalDays}, "estimated_total_transit_cost_krw": 0, "general_recommendations": "建議" },
  "itinerary": {
    "day_1": {
      "date": "${req.startDate}",
      "daily_transit_cost_krw": 0,
      "schedule": [
        {
          "time_slots": "09:00-11:30",
          "spot_name": "名稱", "korean_name": "한국어", "lat": 37.5, "lng": 127.0,
          "estimated_stay_mins": 120,
          "is_reservation_required": false, "reservation_guide": "無",
          "notices": ["提示"],
          "transit_to_next": { "mode": "Subway", "duration_mins": 20, "estimated_cost_krw": 1400, "route_note": "" }
        }
      ]
    }
  }
}`;
}

export async function generateTripPlan(req: TripRequest): Promise<TripPlan> {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL || "https://apihub.agnes-ai.com/v1";
  const model = process.env.AGNES_MODEL || "agnes-2.0-flash";

  if (!apiKey) {
    throw new Error("AGNES_API_KEY 未設定，請檢查 .env 檔案");
  }

  const abortCtrl = new AbortController();

  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 9000,
    maxRetries: 0,
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(req) },
    ],
    temperature: 0.1,
    max_tokens: 3072,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI 回傳內容為空");
  }

  try {
    const parsed: TripPlan = JSON.parse(content);
    return parsed;
  } catch {
    throw new Error(`AI 回傳非合法 JSON：${content.slice(0, 200)}`);
  }
}
