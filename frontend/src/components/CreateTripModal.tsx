import { useState } from "react";

interface Props {
  onSubmit: (data: { destination: string; startDate: string; totalDays: number }) => void;
  loading: boolean;
  onClose: () => void;
}

const CITIES = ["東京", "首爾", "台北", "巴黎", "曼谷", "大阪", "京都", "紐約", "倫敦"];

export function CreateTripModal({ onSubmit, loading, onClose }: Props) {
  const [destination, setDestination] = useState("東京");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [totalDays, setTotalDays] = useState(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold">🌍 建立新旅程</h3>
          <button onClick={onClose} className="text-gray-400 text-lg">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">目的地</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setDestination(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    destination === c ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200"
                  }`}
                >{c}</button>
              ))}
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="或其他城市名稱"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">出發日期</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">天數</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setTotalDays(n)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                      totalDays === n ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                    }`}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => onSubmit({destination, startDate, totalDays})}
          disabled={loading || !destination || !startDate}
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl mt-6 disabled:opacity-40">
          {loading ? "AI 規劃中..." : "✨ 開始規劃"}
        </button>
      </div>
    </div>
  );
}
