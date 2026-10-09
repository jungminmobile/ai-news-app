"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteArticleButton({ articleId }: { articleId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "삭제하지 못했어요.");
        setLoading(false);
        return;
      }
      // 서버 컴포넌트를 다시 불러와 카드를 목록에서 없앤다.
      router.refresh();
    } catch {
      setError("삭제하지 못했어요. 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={loading}
      aria-label="뉴스 삭제"
      title={error ?? "삭제"}
      className={`-mr-1.5 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-lg leading-none transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 ${
        error ? "text-red-700 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
      }`}
    >
      <span aria-hidden>×</span>
    </button>
  );
}
