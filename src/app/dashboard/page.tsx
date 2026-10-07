import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { AppHeader } from "@/components/app-header";
import { CategoryBar, type CategoryFilter } from "@/components/category-bar";
import { NewsCard } from "@/components/news-card";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

function parseFilter(value: string | string[] | undefined): CategoryFilter {
  if (value === "none") return "none";
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return "all";
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { userId } = await auth.protect();
  const filter = parseFilter((await searchParams).category);

  const categoryRows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.id);

  const categoryFilter =
    filter === "none"
      ? isNull(articles.categoryId)
      : typeof filter === "number"
        ? eq(articles.categoryId, filter)
        : undefined;

  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.userId, userId), categoryFilter))
    .orderBy(desc(sql`coalesce(${articles.publishedAt}, ${articles.savedAt})`));

  const categoryNames = new Map(categoryRows.map((c) => [c.id, c.name]));

  return (
    <>
      <AppHeader />
      <CategoryBar categories={categoryRows} selected={filter} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {rows.length === 0 ? (
          <p className="py-24 text-center text-slate-500 dark:text-slate-400">
            {filter === "all"
              ? "저장한 뉴스가 없어요."
              : "이 카테고리에는 뉴스가 없어요."}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((a) => (
              <NewsCard
                key={a.id}
                article={a}
                categoryName={
                  a.categoryId ? (categoryNames.get(a.categoryId) ?? null) : null
                }
              />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
