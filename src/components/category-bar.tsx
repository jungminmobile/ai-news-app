import Link from "next/link";
import { AddCategoryButton } from "@/components/add-category-button";
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
}: {
  categories: Category[];
  selected: CategoryFilter;
}) {
  return (
    <div className="sticky top-14 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
        <Chip href="/dashboard" selected={selected === "all"}>
          전체
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            href={`/dashboard?category=${c.id}`}
            selected={selected === c.id}
          >
            {c.name}
          </Chip>
        ))}
        <Chip href="/dashboard?category=none" selected={selected === "none"}>
          미분류
        </Chip>
        <AddCategoryButton />
      </div>
    </div>
  );
}
