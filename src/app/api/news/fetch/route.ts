import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { enrichArticles } from "@/lib/claude";
import { FEEDS, fetchFeed, type FeedItem } from "@/lib/rss";

export const maxDuration = 60; // Claude 배치 호출 시간 확보

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)));
  const failedSources: string[] = [];
  const byUrl = new Map<string, FeedItem>();
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      failedSources.push(FEEDS[i].source);
      return;
    }
    for (const item of result.value) byUrl.set(item.url, item);
  });

  if (failedSources.length === FEEDS.length) {
    return NextResponse.json(
      { error: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  const items = [...byUrl.values()];
  if (items.length === 0) {
    return NextResponse.json({ added: 0, skipped: 0, failedSources });
  }

  // 이미 저장된 URL은 Claude를 호출하지 않는다(비용 절감).
  const existing = await db
    .select({ url: articles.url })
    .from(articles)
    .where(and(eq(articles.userId, userId), inArray(articles.url, items.map((i) => i.url))));
  const existingUrls = new Set(existing.map((row) => row.url));
  const newItems = items.filter((item) => !existingUrls.has(item.url));
  if (newItems.length === 0) {
    return NextResponse.json({
      added: 0,
      skipped: items.length,
      enrichFailed: 0,
      failedSources,
    });
  }

  const userCategories = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.id);

  const enriched = await enrichArticles(
    newItems,
    userCategories.map((c) => c.name),
  );
  const enrichedByUrl = new Map(enriched.map((e) => [e.url, e]));

  // Claude가 제안한 새 카테고리를 생성하고 이름 → id 맵을 만든다.
  const categoryIds = new Map(userCategories.map((c) => [c.name, c.id]));
  const newNames = [
    ...new Set(
      enriched.map((e) => e.category).filter((n): n is string => !!n && !categoryIds.has(n)),
    ),
  ];
  if (newNames.length > 0) {
    await db
      .insert(categories)
      .values(newNames.map((name) => ({ userId, name })))
      .onConflictDoNothing();
    const refreshed = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.userId, userId));
    for (const c of refreshed) categoryIds.set(c.name, c.id);
  }

  // Claude 처리에 실패한 기사는 영어 원문 + 미분류로 저장한다.
  const inserted = await db
    .insert(articles)
    .values(
      newItems.map((item) => {
        const result = enrichedByUrl.get(item.url);
        return {
          userId,
          url: item.url,
          source: item.source,
          titleEn: item.titleEn,
          titleKo: result?.titleKo ?? item.titleEn,
          summaryKo: result?.summaryKo ?? item.summary,
          categoryId: (result?.category && categoryIds.get(result.category)) || null,
          publishedAt: item.publishedAt,
        };
      }),
    )
    .onConflictDoNothing()
    .returning({ id: articles.id });

  return NextResponse.json({
    added: inserted.length,
    skipped: items.length - inserted.length,
    enrichFailed: newItems.length - enriched.length,
    failedSources,
  });
}
