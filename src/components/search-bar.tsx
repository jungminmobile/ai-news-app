import Link from "next/link";
import type { CategoryFilter } from "@/components/category-bar";

export function SearchBar({
  query,
  category,
}: {
  query: string;
  category: CategoryFilter;
}) {
  return (
    <form
      action="/dashboard"
      method="get"
      role="search"
      className="flex shrink-0 items-center gap-2"
    >
      {category !== "all" && (
        <input type="hidden" name="category" value={String(category)} />
      )}
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="키워드로 뉴스 검색"
        aria-label="키워드 검색"
        className="min-w-0 flex-1 rounded-lg sm:w-56 sm:flex-none border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-100 dark:placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        검색
      </button>
      {query && (
        <Link
          href={category === "all" ? "/dashboard" : `/dashboard?category=${category}`}
          className="shrink-0 rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
