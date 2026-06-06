import { Router, Request, Response } from "express";
import { generateTripPlan } from "../services/agnes";
import { TripRequest, ApiResponse } from "../types";

const router = Router();

router.post("/plan", async (req: Request, res: Response) => {
  try {
    const body: TripRequest = req.body;

    if (!body.startDate || !body.totalDays || !body.spots?.length || !body.hotelName) {
      const response: ApiResponse = {
        success: false,
        error: "缺少必要欄位：startDate, totalDays, spots, hotelName",
      };
      res.status(400).json(response);
      return;
    }

    const plan = await generateTripPlan(body);
    const response: ApiResponse = { success: true, data: plan };
    res.json(response);
  } catch (err: any) {
    console.error("AI 排程錯誤:", err);
    const response: ApiResponse = {
      success: false,
      error: err.message || "AI 排程服務異常，請稍後再試",
    };
    res.status(500).json(response);
  }
});

export default router;
