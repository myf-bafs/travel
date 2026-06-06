import OpenAI from "openai";
import { TripRequest, TripPlan } from "../types";

const SYSTEM_PROMPT = `你是一位精通南韓自由行（特別是首爾、釜山、濟州島）的頂級智慧導遊兼數據架構師。
你的任務是根據使用者提供的景點清單、住宿點、日期與旅行偏好，編排一套完全符合地理邏輯、交通時間最佳化、且包含費用與預約提醒的精準行程。

【嚴格執行規則】：
1. 必須考慮南韓景點的真實公休日（例如：景福宮週二公休、美術館週一公休），絕不能在公休日安排該景點。
2. 景點之間的順序必須依據地理位置由近到遠優化，拒絕走回頭路。
3. 計算兩點之間的交通時，預估合理的南韓大眾運輸費用（地鐵基本費1,400韓元起）或計程車車資（韓元）。
4. 識別哪些景點是需要提前預約的（如：膠囊列車、特定夜間開放、熱門餐廳），並給出預約時程建議。
5. 請直接以純 JSON 格式回傳，不要包含任何 markdown 語法外殼（不要包裹 \`\`\`json），必須符合指定的 Schema。
6. 每個 schedule item 請附上 approximate lat/lng 經緯度座標（WGS84），以便前端地圖渲染。`;

function buildUserPrompt(req: TripRequest): string {
  return `【使用者輸入資料】
- 出發日期：${req.startDate}
- 旅遊天數：${req.totalDays}天
- 每日活動時間：${req.dailyStartTime} - ${req.dailyEndTime}
- 每日起點/終點（飯店）：${req.hotelName}
- 景點願望清單：${req.spots.join("、")}
- 旅行步調：${req.pace}

【請嚴格按照以下 JSON Schema 回傳資料】：
{
  "trip_summary": {
    "total_days": ${req.totalDays},
    "estimated_total_transit_cost_krw": 0,
    "general_recommendations": "整體行程的交通與購票卡片建議"
  },
  "itinerary": {
    "day_1": {
      "date": "${req.startDate}",
      "daily_transit_cost_krw": 0,
      "schedule": [
        {
          "time_slots": "09:00 - 11:30",
          "spot_name": "景點名稱",
          "korean_name": "韓文名稱",
          "lat": 37.5796,
          "lng": 126.9770,
          "estimated_stay_mins": 150,
          "is_reservation_required": true,
          "reservation_guide": "預約開放規則與注意事項，若不需預約則填寫無",
          "notices": [
            "避坑提示1（如：週二公休，請注意）",
            "文化或穿著提示2"
          ],
          "transit_to_next": {
            "mode": "Subway / Bus / Taxi / Walk",
            "duration_mins": 20,
            "estimated_cost_krw": 1400,
            "route_note": "從地鐵3號線某站坐到某站"
          }
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

  const client = new OpenAI({
    apiKey,
    baseURL,
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(req) },
    ],
    temperature: 0.3,
    max_tokens: 8192,
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
