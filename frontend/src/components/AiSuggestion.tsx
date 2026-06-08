import { useState, useEffect } from "react";
import { SuggestItem } from "../types";

interface Props {
  destination: string;
  dayKey: string;
  existingSpots: string[];
  onImport: (spot: SuggestItem) => void;
}

export function AiSuggestion({ destination, dayKey, existingSpots, onImport }: Props) {
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [imported, setImported] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!destination || !dayKey || existingSpots.length === 0) { return; }
    let cancelled = false;
    setDismissed(false);
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination, dayKey, existingSpots }),
        });
        const json = await res.json();
        if (!cancelled && json.success && json.data?.suggestions) {
          setItems(json.data.suggestions.filter((s: SuggestItem) => !existingSpots.includes(s.spot_name)));
        }
      } catch {} finally { if (!cancelled) setLoading(false); }
    }, 2000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [destination, dayKey, existingSpots]);

  if (dismissed || (items.length === 0 && !loading)) return null;

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-purple-700">💡 景點建議</span>
        {!loading && <button onClick={() => setDismissed(true)} className="text-xs text-purple-300">✕</button>}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-purple-500">
          <div className="spinner !border-purple-400 !w-3 !h-3" />AI 分析中...
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(s => (
            <div key={s.spot_name} className="flex items-center justify-between bg-white rounded-lg px-2.5 py-2 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{s.spot_name}</p>
                <p className="text-[10px] text-gray-400 truncate">{s.reason}</p>
              </div>
              <button onClick={() => { onImport(s); setImported(p => new Set(p).add(s.spot_name)); }}
                className="shrink-0 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-lg ml-2 font-medium">
                導入
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
