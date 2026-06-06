interface SpotInfo {
  korean_name: string;
  lat: number;
  lng: number;
  reservation_required: boolean;
  reservation_guide: string;
  closed_days: string;
  notices: string[];
}

export const SPOT_DB: Record<string, SpotInfo> = {
  "景福宮": {
    korean_name: "경복궁",
    lat: 37.5796,
    lng: 126.9770,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "週二",
    notices: ["週二公休，請避開", "穿韓服可免費入場"],
  },
  "北村韓屋村": {
    korean_name: "북촌한옥마을",
    lat: 37.5826,
    lng: 126.9860,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["居民區，請保持安靜", "多坡道，建議穿平底鞋"],
  },
  "N首爾塔": {
    korean_name: "N서울타워",
    lat: 37.5512,
    lng: 126.9882,
    reservation_required: true,
    reservation_guide: "建議提前在 Klook 預約門票，傍晚時段熱門",
    closed_days: "無",
    notices: ["建議傍晚前往看夜景", "可搭纜車上山"],
  },
  "廣藏市場": {
    korean_name: "광장시장",
    lat: 37.5700,
    lng: 126.9993,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "週日",
    notices: ["建議帶現金", "必吃生牛肉拌飯、綠豆煎餅"],
  },
  "弘大商圈": {
    korean_name: "홍대입구",
    lat: 37.5563,
    lng: 126.9236,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["適合逛街與街頭表演", "晚餐可選韓式炸雞或烤肉"],
  },
  "明洞商圈": {
    korean_name: "명동",
    lat: 37.5609,
    lng: 126.9860,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["適合購物與換錢", "注意夜市人潮"],
  },
  "江南 COEX 星空圖書館": {
    korean_name: "코엑스 별마당도서관",
    lat: 37.5112,
    lng: 127.0590,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["商場內免費參觀", "適合拍照"],
  },
  "梨泰院": {
    korean_name: "이태원",
    lat: 37.5345,
    lng: 126.9940,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["異國料理集中地", "夜生活豐富"],
  },
  "仁寺洞": {
    korean_name: "인사동",
    lat: 37.5733,
    lng: 126.9855,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["傳統文化街", "適合買紀念品"],
  },
  "釜山海雲台": {
    korean_name: "부산 해운대",
    lat: 35.1587,
    lng: 129.1604,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["10月海水偏涼，適合散步", "注意防曬"],
  },
  "甘川文化村": {
    korean_name: "감천문화마을",
    lat: 35.0977,
    lng: 129.0106,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["彩色山坡小屋適合拍照", "早點去避開人潮"],
  },
  "海雲台膠囊列車": {
    korean_name: "해운대 스카이캡슐",
    lat: 35.1597,
    lng: 129.1632,
    reservation_required: true,
    reservation_guide: "必須提前在 Klook 預約，建議預約中午場次",
    closed_days: "無",
    notices: ["觀光列車，非通勤工具", "注意班次時間"],
  },
  "濟州島城山日出峰": {
    korean_name: "성산일출봉",
    lat: 33.4581,
    lng: 126.9426,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["建議清晨前往看日出", "需購買門票"],
  },
  "牛島": {
    korean_name: "우도",
    lat: 33.4229,
    lng: 126.9337,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["需從城山港搭船", "可租電動腳踏車環島"],
  },
  "釜山札嘎其市場": {
    korean_name: "자갈치시장",
    lat: 35.0995,
    lng: 129.0304,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "週一",
    notices: ["韓國最大海鮮市場", "可現買現吃"],
  },
  "慶州良洞村": {
    korean_name: "양동마을",
    lat: 35.8402,
    lng: 129.2773,
    reservation_required: false,
    reservation_guide: "無",
    closed_days: "無",
    notices: ["世界文化遺產", "傳統韓屋村落"],
  },
};

export function enrichSpot(rawName: string, partial: any): any {
  // Direct match
  let info = SPOT_DB[rawName];

  // Partial match: check if any DB key is contained in or contains the raw name
  if (!info) {
    for (const [key, val] of Object.entries(SPOT_DB)) {
      if (rawName.includes(key) || key.includes(rawName)) {
        info = val;
        break;
      }
    }
  }

  if (!info) return partial;

  return {
    ...partial,
    korean_name: info.korean_name,
    lat: info.lat,
    lng: info.lng,
    is_reservation_required: info.reservation_required,
    reservation_guide: info.reservation_guide,
    notices: info.notices,
  };
}

export function getClosedDays(spotName: string): string {
  return SPOT_DB[spotName]?.closed_days || "";
}
