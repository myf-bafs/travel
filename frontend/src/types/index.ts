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

export interface GlobalSpot {
  id: string;
  city: string;
  name: string;
  desc: string;
  lat: number;
  lng: number;
}

export const GLOBAL_SPOTS: GlobalSpot[] = [
  { id: "tk1", city: "東京", name: "淺草寺", desc: "東京最古老寺廟，雷門打卡必備", lat: 35.7147, lng: 139.7966 },
  { id: "tk2", city: "東京", name: "東京晴空塔", desc: "俯瞰東京全景的絕佳地標", lat: 35.7100, lng: 139.8107 },
  { id: "tk3", city: "東京", name: "秋葉原", desc: "動漫與電器愛好者的天堂", lat: 35.6983, lng: 139.7731 },
  { id: "tk4", city: "東京", name: "澀谷", desc: "年輕文化與潮流發源地", lat: 35.6595, lng: 139.7004 },
  { id: "tk5", city: "東京", name: "新宿", desc: "繁華商業區與夜生活", lat: 35.6896, lng: 139.7006 },
  { id: "tk6", city: "東京", name: "東京塔", desc: "東京經典地標夜景", lat: 35.6586, lng: 139.7454 },
  { id: "tk7", city: "東京", name: "明治神宮", desc: "都市中的寧靜神社", lat: 35.6764, lng: 139.6993 },
  { id: "tk8", city: "東京", name: "銀座", desc: "高級購物與美食天堂", lat: 35.6717, lng: 139.7650 },
  { id: "sl1", city: "首爾", name: "景福宮", desc: "韓國最具代表性的王宮", lat: 37.5796, lng: 126.9770 },
  { id: "sl2", city: "首爾", name: "北村韓屋村", desc: "傳統韓屋體驗", lat: 37.5826, lng: 126.9860 },
  { id: "sl3", city: "首爾", name: "N首爾塔", desc: "首爾地標夜景", lat: 37.5512, lng: 126.9882 },
  { id: "sl4", city: "首爾", name: "明洞", desc: "首爾最繁華購物商圈", lat: 37.5609, lng: 126.9860 },
  { id: "sl5", city: "首爾", name: "弘大商圈", desc: "年輕人文化與街頭表演", lat: 37.5563, lng: 126.9236 },
  { id: "tp1", city: "台北", name: "台北101", desc: "台灣地標，可登觀景台", lat: 25.0339, lng: 121.5644 },
  { id: "tp2", city: "台北", name: "九份", desc: "山城老街與夜景", lat: 25.1100, lng: 121.8446 },
  { id: "tp3", city: "台北", name: "西門町", desc: "年輕潮流商圈", lat: 25.0420, lng: 121.5080 },
  { id: "pr1", city: "巴黎", name: "艾菲爾鐵塔", desc: "巴黎經典地標", lat: 48.8584, lng: 2.2945 },
  { id: "pr2", city: "巴黎", name: "羅浮宮", desc: "世界最大博物館", lat: 48.8606, lng: 2.3376 },
  { id: "pr3", city: "巴黎", name: "凱旋門", desc: "香榭麗舍大道地標", lat: 48.8738, lng: 2.2950 },
  { id: "bk1", city: "曼谷", name: "大皇宮", desc: "泰國最神聖皇宮", lat: 13.7500, lng: 100.4914 },
  { id: "bk2", city: "曼谷", name: "臥佛寺", desc: "泰國最大臥佛", lat: 13.7467, lng: 100.4929 },
  { id: "os1", city: "大阪", name: "大阪城", desc: "日本歷史名城", lat: 34.6873, lng: 135.5262 },
  { id: "os2", city: "大阪", name: "道頓堀", desc: "大阪美食娛樂區", lat: 34.6688, lng: 135.5012 },
  { id: "ky1", city: "京都", name: "清水寺", desc: "京都最古老寺廟", lat: 34.9949, lng: 135.7850 },
  { id: "ky2", city: "京都", name: "伏見稻荷大社", desc: "千本鳥居聞名", lat: 34.9671, lng: 135.7727 },
];

export const PACE_OPTIONS: { value: TripFormData["pace"]; label: string; desc: string }[] = [
  { value: "精實", label: "精實", desc: "緊湊高效" },
  { value: "一般", label: "一般", desc: "平衡舒適" },
  { value: "悠閒", label: "悠閒", desc: "慢活體驗" },
];
