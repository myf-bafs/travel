import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import planRouter from "./routes/plan";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const isDev = process.env.NODE_ENV !== "production";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", planRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", model: process.env.AGNES_MODEL || "agnes-2.0-flash" });
});

if (!isDev) {
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🇰🇷 韓國旅遊規劃後端啟動於 http://localhost:${PORT}`);
  console.log(`🤖 AI Model: ${process.env.AGNES_MODEL || "agnes-2.0-flash"}`);
  console.log(`📦 Mode: ${isDev ? "development" : "production"}`);
});
