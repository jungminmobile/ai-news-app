import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, notionSaves } from "@/db/schema";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/articles/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(articles)
      .where(and(eq(articles.id, Number(id)), eq(articles.userId, userId)))
      .returning({ url: articles.url });
    if (!deleted) {
      return NextResponse.json({ error: "뉴스를 찾을 수 없어요." }, { status: 404 });
    }

    // 같은 기사를 다시 저장했을 때 Notion 저장이 '이미 저장됨'으로 막히지 않도록 기록도 지운다.
    await db
      .delete(notionSaves)
      .where(and(eq(notionSaves.userId, userId), eq(notionSaves.articleUrl, deleted.url)));

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Article delete failed", error);
    return NextResponse.json(
      { error: "삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
