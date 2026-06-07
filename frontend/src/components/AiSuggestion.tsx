import { useState, useEffect } from "react";
import { SuggestItem } from "../types";
import { Sparkle, DownloadSimple, X } from "@phosphor-icons/react";

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
  const [imported, setImported] = useState<string[]>([]);

  useEffect(() => {
    if (!destination || !dayKey || existingSpots.length === 0) {
      setSuggestions([]);
      return;
    }
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
    setImported((prev) => [...prev, s.spot_name]);
    setSuggestions((prev) => prev.filter((x) => x.spot_name !== s.spot_name));
  };

  if (suggestions.length === 0 && !loading) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-2xl p-4 transition-all duration-300">
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-primary-blue p-2 rounded-full shrink-0">
            <Sparkle className="text-xl" weight="fill" />
          </div>
          <div className="flex items-center gap-2">
            <span className="spinner !border-blue-400 !border-t-transparent" />
            <span className="text-sm text-slate-600">AI 分析中...</span>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 text-primary-blue p-2 rounded-full shrink-0">
            <Sparkle className="text-xl" weight="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800 flex justify-between items-center">
              Agnes AI 行程建議
              <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600 p-0.5">
                <X size={16} />
              </button>
            </h4>
            <div className="space-y-2 mt-2">
              {suggestions.map((s) => (
                <div key={s.spot_name} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{s.spot_name}</p>
                    <p className="text-xs text-slate-500 truncate">{s.reason}</p>
                  </div>
                  <button
                    onClick={() => handleImport(s)}
                    disabled={imported.includes(s.spot_name)}
                    className="shrink-0 bg-primary-blue hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 disabled:opacity-40"
                  >
                    <DownloadSimple size={14} />
                    導入
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
