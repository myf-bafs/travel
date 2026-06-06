import { TripFormData, ApiResponse } from "../types";

const API_BASE = "/api";

export async function planTrip(data: TripFormData): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      error: `伺服器異常（${res.status}）：${text.slice(0, 200)}`,
    };
  }
}
