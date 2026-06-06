# 🇰🇷 Korea Trip Planner — 韓國旅遊智慧排程系統

基於 **Agnes AI (`agnes-2.0-flash`)** 的韓國自由行智慧排程網站，支援景點地理排序、公休日檢查、交通費估算、預約提醒等完整功能。

## ✨ 功能特色

- **AI 智慧排程** — 輸入景點清單，Agnes AI 自動依地理位置安排每日最佳路線
- **公休日偵測** — 自動檢查景點公休日（如景福宮週二休），衝突時發出警告
- **交通費用估算** — 預估地鐵/巴士/計程車車資，統計每日與總交通預算
- **預約提醒系統** — 標記需預約景點，提供黃金搶票期與官方預約連結建議
- **在地化小撇步** — 針對各景點提供文化注意事項與避坑提示

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 後端 | Express + TypeScript |
| AI | Agnes AI (`agnes-2.0-flash`) via OpenAI-compatible API |

## 快速開始

### 1. 安裝依賴

```bash
npm install
npm run install:all
```

### 2. 設定環境變數

```bash
cp backend/.env.example backend/.env
```

編輯 `backend/.env`，填入你的 Agnes AI API Key：

```env
AGNES_API_KEY=sk-your-key-here
AGNES_BASE_URL=https://api.agnes.ai/v1
AGNES_MODEL=agnes-2.0-flash
PORT=3001
CORS_ORIGINS=http://localhost:5173
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

前端運行於 `http://localhost:5173`，後端運行於 `http://localhost:3001`。

### 4. 開啟瀏覽器

前往 [http://localhost:5173](http://localhost:5173) 開始使用。

## API 文件

### `POST /api/plan`

呼叫 Agnes AI 進行行程排程。

**Request Body:**

```json
{
  "startDate": "2026-10-15",
  "totalDays": 3,
  "dailyStartTime": "09:00",
  "dailyEndTime": "20:00",
  "hotelName": "明洞九樹飯店",
  "spots": ["景福宮", "北村韓屋村", "N首爾塔"],
  "pace": "一般"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "trip_summary": { ... },
    "itinerary": { ... }
  }
}
```

## 專案結構

```
travel-planner/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express 伺服器入口
│   │   ├── routes/plan.ts     # /api/plan 路由
│   │   ├── services/agnes.ts  # Agnes AI API 串接
│   │   └── types/index.ts     # TypeScript 型別
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # 主應用
│   │   ├── api/planTrip.ts    # API 客戶端
│   │   ├── types/index.ts     # TypeScript 型別
│   │   └── components/
│   │       ├── TripForm.tsx    # 輸入表單
│   │       └── ItineraryView.tsx  # 行程顯示
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
├── package.json               # 根目錄腳本
├── .gitignore
└── README.md
```

## 部署

### 後端

```bash
cd backend
npm run build
node dist/index.js
```

### 前端

```bash
cd frontend
npm run build
# 輸出在 frontend/dist/
```

## License

MIT
