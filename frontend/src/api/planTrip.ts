import { TripFormData, ApiResponse } from "../types";

const API_BASE = "/api";

export async function planTrip(data: TripFormData): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
