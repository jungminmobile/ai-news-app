import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { FEEDS, fetchFeed, type FeedItem } from "@/lib/rss";

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

  // 번역·분류 전이라 한국어 컬럼에는 영어 원문을 임시로 넣는다(이후 Claude 단계에서 덮어씀).
  const inserted = await db
    .insert(articles)
    .values(
      items.map((item) => ({
        userId,
        url: item.url,
        source: item.source,
        titleEn: item.titleEn,
        titleKo: item.titleEn,
        summaryKo: item.summary,
        publishedAt: item.publishedAt,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: articles.id });

  return NextResponse.json({
    added: inserted.length,
    skipped: items.length - inserted.length,
    failedSources,
  });
}
