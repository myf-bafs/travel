export interface TripRequest {
  startDate: string;
  totalDays: number;
  dailyStartTime: string;
  dailyEndTime: string;
  hotelName: string;
  spots: string[];
  pace: "精實" | "一般" | "悠閒";
}

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
