import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import planRouter from "./routes/plan";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173").split(",");

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api", planRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", model: process.env.AGNES_MODEL || "agnes-2.0-flash" });
});

app.listen(PORT, () => {
  console.log(`🇰🇷 韓國旅遊規劃後端啟動於 http://localhost:${PORT}`);
  console.log(`🤖 AI Model: ${process.env.AGNES_MODEL || "agnes-2.0-flash"}`);
});
