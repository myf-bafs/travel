import { Router, Request, Response } from "express";
import { generateTripPlan, suggestSpots } from "../services/agnes";
import { TripRequest, ApiResponse, SuggestRequest, SuggestResponse } from "../types";

const router = Router();

router.post("/plan", async (req: Request, res: Response) => {
  try {
    const body: TripRequest = req.body;

    if (!body.startDate || !body.totalDays || !body.hotelName) {
      const response: ApiResponse = { success: false, error: "缺少必要欄位：startDate, totalDays, hotelName" };
      res.status(400).json(response);
      return;
    }

    const plan = await generateTripPlan(body);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    console.error("AI 排程錯誤:", err);
    const isTimeout =
      err?.message?.includes("timeout") ||
      err?.message?.includes("TIMEOUT") ||
      err?.name === "AbortError" ||
      err?.code === "ETIMEDOUT";
    res.status(500).json({
      success: false,
      error: isTimeout
        ? "AI 排程請求逾時，請減少景點數量或簡化行程後重試"
        : err.message || "AI 排程服務異常，請稍後再試",
    });
  }
});

router.post("/suggest", async (req: Request, res: Response) => {
  try {
    const body: SuggestRequest = req.body;
    if (!body.destination || !body.dayKey || !body.existingSpots?.length) {
      res.json({ success: true, data: { suggestions: [] } });
      return;
    }

    const suggestions = await suggestSpots(body);
    res.json({ success: true, data: { suggestions } });
  } catch {
    res.json({ success: true, data: { suggestions: [] } });
  }
});

export default router;
