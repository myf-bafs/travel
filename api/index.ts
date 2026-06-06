import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import planRouter from "../backend/src/routes/plan";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", planRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", model: process.env.AGNES_MODEL || "agnes-2.0-flash" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: err?.message || "伺服器內部錯誤",
  });
});

export default app;
