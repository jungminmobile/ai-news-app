"use client";

import { useState } from "react";

const base =
  "flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

export function SaveToNotionButton({
  articleId,
  initialSaved,
}: {
  articleId: number;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (loading || saved) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notion/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "저장하지 못했어요.");
        return;
      }
      setSaved(true);
    } catch {
      setError("저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <button
        type="button"
        disabled
        className={`${base} bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400`}
      >
        저장됨
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={loading}
      title={error ?? undefined}
      className={`${base} bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {loading ? "저장 중…" : error ? "다시 시도" : "뉴스 저장"}
    </button>
  );
}
