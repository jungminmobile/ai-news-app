import Link from "next/link";
import { AddCategoryButton } from "@/components/add-category-button";
import { SearchBar } from "@/components/search-bar";
import type { Category } from "@/db/schema";

export type CategoryFilter = "all" | "none" | number;

const chipBase =
  "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const chipSelected = "bg-indigo-600 font-medium text-white";
const chipDefault =
  "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800";

function Chip({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-pressed={selected}
      className={`${chipBase} ${selected ? chipSelected : chipDefault}`}
    >
      {children}
    </Link>
  );
}

export function CategoryBar({
  categories,
  selected,
  query = "",
}: {
  categories: Category[];
  selected: CategoryFilter;
  query?: string;
}) {
  // 카테고리를 바꿔도 검색어는 유지한다.
  const q = query ? `q=${encodeURIComponent(query)}` : "";
  const hrefFor = (category?: string) => {
    const qs = [category ? `category=${category}` : "", q]
      .filter(Boolean)
      .join("&");
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };
  return (
    <div className="sticky top-14 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          <Chip href={hrefFor()} selected={selected === "all"}>
            전체
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.id}
              href={hrefFor(String(c.id))}
              selected={selected === c.id}
            >
              {c.name}
            </Chip>
          ))}
          <Chip href={hrefFor("none")} selected={selected === "none"}>
            미분류
          </Chip>
          <AddCategoryButton />
        </div>
        <SearchBar query={query} category={selected} />
      </div>
    </div>
  );
}
