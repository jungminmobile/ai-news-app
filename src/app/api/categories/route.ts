import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";

const MAX_NAME_LENGTH = 30;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.id);
  return NextResponse.json({ categories: rows });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `카테고리 이름은 1~${MAX_NAME_LENGTH}자로 입력해 주세요.` },
      { status: 400 },
    );
  }

  const [created] = await db
    .insert(categories)
    .values({ userId, name })
    .onConflictDoNothing()
    .returning();
  if (!created) {
    return NextResponse.json(
      { error: "이미 있는 카테고리예요." },
      { status: 409 },
    );
  }
  return NextResponse.json({ category: created }, { status: 201 });
}
