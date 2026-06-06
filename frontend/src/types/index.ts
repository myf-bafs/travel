export interface TransitInfo {
  mode: "Subway" | "Bus" | "Taxi" | "Walk" | "KTX";
  duration_mins: number;
  estimated_cost_krw: number;
  route_note?: string;
}

export interface ScheduleItem {
  time_slots: string;
  spot_name: string;
  korean_name?: string;
  lat?: number;
  lng?: number;
  estimated_stay_mins: number;
  is_reservation_required?: boolean;
  reservation_guide?: string;
  notices?: string[];
  transit_to_next: TransitInfo;
}

export interface DayPlan {
  date: string;
  daily_transit_cost_krw: number;
  schedule: ScheduleItem[];
}

export interface TripSummary {
  total_days: number;
  estimated_total_transit_cost_krw: number;
  general_recommendations: string;
}

export interface TripPlan {
  trip_summary: TripSummary;
  itinerary: Record<string, DayPlan>;
}

export interface ApiResponse {
  success: boolean;
  data?: TripPlan;
  error?: string;
}

export interface TripFormData {
  destination: string;
  startDate: string;
  totalDays: number;
  dailyStartTime: string;
  dailyEndTime: string;
  hotelName: string;
  spots: string[];
  pace: "精實" | "一般" | "悠閒";
}

export interface SuggestItem {
  spot_name: string;
  reason: string;
}

export interface SuggestResponse {
  success: boolean;
  data?: { suggestions: SuggestItem[] };
  error?: string;
}

export const PACE_OPTIONS: { value: TripFormData["pace"]; label: string; desc: string }[] = [
  { value: "精實", label: "精實", desc: "緊湊高效，景點滿檔" },
  { value: "一般", label: "一般", desc: "平衡舒適，適度休息" },
  { value: "悠閒", label: "悠閒", desc: "慢活體驗，深度探索" },
];

export const POPULAR_SPOTS: Record<string, string[]> = {
  "首爾": ["景福宮", "北村韓屋村", "N首爾塔", "廣藏市場", "弘大商圈", "明洞商圈", "江南 COEX 星空圖書館", "梨泰院", "仁寺洞"],
  "釜山": ["釜山海雲台", "甘川文化村", "海雲台膠囊列車", "釜山札嘎其市場"],
  "濟州島": ["濟州島城山日出峰", "牛島"],
  "東京": ["淺草寺", "澀谷", "新宿", "秋葉原", "東京塔", "銀座", "原宿", "上野公園"],
  "大阪": ["大阪城", "道頓堀", "環球影城", "心齋橋", "通天閣"],
  "京都": ["清水寺", "伏見稻荷大社", "金閣寺", "嵐山", "祇園"],
  "巴黎": ["艾菲爾鐵塔", "羅浮宮", "凱旋門", "聖母院", "蒙馬特"],
  "台北": ["台北101", "九份", "故宮博物院", "西門町", "士林夜市"],
  "曼谷": ["大皇宮", "臥佛寺", "Terminal 21", "恰圖恰市集", "水門市場"],
};

export function getPopularSpots(destination: string): string[] {
  return POPULAR_SPOTS[destination] || [];
}
