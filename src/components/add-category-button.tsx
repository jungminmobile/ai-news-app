"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function AddCategoryButton() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function open() {
    setName("");
    setError(null);
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "카테고리를 추가하지 못했어요.");
        return;
      }
      dialogRef.current?.close();
      router.refresh();
    } catch {
      setError("카테고리를 추가하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="카테고리 추가"
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-gray-600 dark:text-slate-400"
      >
        <span aria-hidden>+</span> 카테고리 추가
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="add-category-title"
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-md backdrop:bg-black/40 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-100"
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <h2 id="add-category-title" className="text-base font-semibold">
            카테고리 추가
          </h2>
          <div className="flex flex-col gap-1.5">
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="카테고리 이름"
              aria-label="카테고리 이름"
              aria-invalid={error !== null}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || name.trim() === ""}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
            >
              {submitting ? "추가하는 중…" : "추가"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
