export interface TransitInfo {
  mode: "Subway" | "Bus" | "Taxi" | "Walk";
  duration_mins: number;
  estimated_cost_krw: number;
  route_note: string;
}

export interface ScheduleItem {
  time_slots: string;
  spot_name: string;
  korean_name: string;
  estimated_stay_mins: number;
  is_reservation_required: boolean;
  reservation_guide: string;
  notices: string[];
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
  startDate: string;
  totalDays: number;
  dailyStartTime: string;
  dailyEndTime: string;
  hotelName: string;
  spots: string[];
  pace: "精實" | "一般" | "悠閒";
}

export const PACE_OPTIONS: { value: TripFormData["pace"]; label: string; desc: string }[] = [
  { value: "精實", label: "精實", desc: "緊湊高效，景點滿檔" },
  { value: "一般", label: "一般", desc: "平衡舒適，適度休息" },
  { value: "悠閒", label: "悠閒", desc: "慢活體驗，深度探索" },
];

export const POPULAR_SPOTS = [
  "景福宮",
  "北村韓屋村",
  "N首爾塔",
  "廣藏市場",
  "弘大商圈",
  "明洞商圈",
  "江南 COEX 星空圖書館",
  "梨泰院",
  "仁寺洞",
  "釜山海雲台",
  "甘川文化村",
  "海雲台膠囊列車",
  "濟州島城山日出峰",
  "牛島",
  "釜山札嘎其市場",
  "慶州良洞村",
];
