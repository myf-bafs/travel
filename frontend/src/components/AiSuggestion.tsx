import { useState, useEffect } from "react";
import { SuggestItem } from "../types";

interface Props {
  destination: string;
  dayKey: string;
  existingSpots: string[];
  onImport: (spot: SuggestItem) => void;
}

export function AiSuggestion({ destination, dayKey, existingSpots, onImport }: Props) {
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [imported, setImported] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!destination || !dayKey || existingSpots.length === 0) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
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
          setSuggestions(json.data.suggestions.filter((s: SuggestItem) => !existingSpots.includes(s.spot_name)));
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [destination, dayKey, existingSpots]);

  if (dismissed || suggestions.length === 0) return null;

  const handleImport = (s: SuggestItem) => {
    onImport(s);
    setImported((prev) => new Set(prev).add(s.spot_name));
    setSuggestions((prev) => prev.filter((x) => x.spot_name !== s.spot_name));
  };

  if (suggestions.length === 0 && !loading) return null;

  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-purple-700">💡 Agnes AI 行程建議</h3>
        <button onClick={() => setDismissed(true)} className="text-xs text-purple-300">✕ 關閉</button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
          <span className="text-xs text-purple-500">AI 分析中...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((s) => (
            <div key={s.spot_name} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{s.spot_name}</p>
                <p className="text-[11px] text-gray-400 truncate">{s.reason}</p>
              </div>
              <button
                onClick={() => handleImport(s)}
                disabled={imported.has(s.spot_name)}
                className="shrink-0 rounded-lg bg-purple-600 px-2.5 py-1 text-[11px] font-medium text-white disabled:opacity-40"
              >
                {imported.has(s.spot_name) ? "✓ 已導入" : "導入"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
