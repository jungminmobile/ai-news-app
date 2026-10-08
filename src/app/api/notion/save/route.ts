import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, notionSaves } from "@/db/schema";

// Notion rich_text 한 덩어리는 2000자까지만 허용한다.
const RICH_TEXT_LIMIT = 2000;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.NOTION_TOKEN?.trim();
  // URL에서 복사한 값(끝의 "?v=…" 등)이 섞여도 32자리 ID만 사용한다.
  const databaseId = process.env.NOTION_DATABASE_ID?.match(
    /[0-9a-f]{32}|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/i,
  )?.[0];
  if (!token || !databaseId) {
    return NextResponse.json(
      { error: "Notion 설정이 없어요. NOTION_TOKEN과 NOTION_DATABASE_ID를 확인해 주세요." },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const articleId = Number(body?.articleId);
  if (!Number.isInteger(articleId)) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const [row] = await db
    .select({ article: articles, categoryName: categories.name })
    .from(articles)
    .leftJoin(categories, eq(categories.id, articles.categoryId))
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId)));
  if (!row) {
    return NextResponse.json({ error: "뉴스를 찾을 수 없어요." }, { status: 404 });
  }
  const { article, categoryName } = row;

  const [already] = await db
    .select({ id: notionSaves.id })
    .from(notionSaves)
    .where(and(eq(notionSaves.userId, userId), eq(notionSaves.articleUrl, article.url)));
  if (already) return NextResponse.json({ saved: true, alreadySaved: true });

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        제목: { title: [{ text: { content: article.titleKo } }] },
        "원문 링크": { url: article.url },
        텍스트: {
          rich_text: [{ text: { content: article.summaryKo.slice(0, RICH_TEXT_LIMIT) } }],
        },
        ...(categoryName && { 카테고리: { select: { name: categoryName } } }),
        ...(article.publishedAt && {
          날짜: { date: { start: article.publishedAt.toISOString() } },
        }),
      },
    }),
  });
  const page = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("Notion save failed", res.status, page?.code, page?.message);
    return NextResponse.json(
      { error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  await db.insert(notionSaves).values({
    userId,
    articleUrl: article.url,
    notionPageUrl: page.url,
  });

  return NextResponse.json({ saved: true });
}
