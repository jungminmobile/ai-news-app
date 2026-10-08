"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  );

  async function fetchNews() {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage({
          text: data?.error ?? "뉴스를 가져오지 못했어요.",
          isError: true,
        });
        return;
      }
      const partial =
        data.failedSources?.length > 0
          ? ` (${data.failedSources.join(", ")} 실패)`
          : "";
      setMessage({
        text: `${data.added}건 추가${partial}`,
        isError: data.failedSources?.length > 0,
      });
      router.refresh();
    } catch {
      setMessage({
        text: "뉴스를 가져오지 못했어요. 다시 시도해 주세요.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {message && (
        <span
          role="status"
          className={`hidden text-xs sm:inline ${
            message.isError
              ? "text-red-700 dark:text-red-400"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {message.text}
        </span>
      )}
      <button
        type="button"
        onClick={fetchNews}
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </>
  );
}
