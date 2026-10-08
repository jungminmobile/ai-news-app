import Anthropic from "@anthropic-ai/sdk";
import type { FeedItem } from "@/lib/rss";

const MODEL = "claude-haiku-4-5-20251001";
const BATCH_SIZE = 5;
const MAX_CATEGORY_LENGTH = 30;

export type Enriched = {
  url: string;
  titleKo: string;
  summaryKo: string;
  category: string | null;
};

const SYSTEM_PROMPT = `당신은 해외 AI 뉴스를 한국어로 정리하는 편집자입니다.
입력으로 받은 기사 각각에 대해 다음을 수행하세요.
- titleKo: 제목을 자연스러운 한국어로 번역
- summaryKo: 핵심만 담은 2~3문장 한국어 요약 (입력 요약에 없는 내용은 지어내지 않기)
- category: 주제를 나타내는 짧은 한국어 카테고리명 (${MAX_CATEGORY_LENGTH}자 이내)
  · 사용자의 기존 카테고리 목록에 맞는 것이 있으면 반드시 그 이름을 그대로 사용
  · 맞는 것이 없을 때만 새 이름을 제안

응답은 JSON 배열만 출력하세요(설명, 코드 블록 금지).
각 원소: {"url": 입력 url 그대로, "titleKo": "...", "summaryKo": "...", "category": "..."}`;

let client: Anthropic | null = null;

function getClient() {
  client ??= new Anthropic(); // ANTHROPIC_API_KEY 환경 변수를 사용
  return client;
}

function parseResponse(text: string): unknown {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end <= start) throw new Error("JSON 배열이 없어요");
  return JSON.parse(text.slice(start, end + 1));
}

function cleanCategory(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  if (!name || name.length > MAX_CATEGORY_LENGTH) return null;
  return name;
}

async function enrichBatch(
  batch: FeedItem[],
  categories: string[],
): Promise<Enriched[]> {
  const input = batch.map((item) => ({
    url: item.url,
    title: item.titleEn,
    summary: item.summary,
  }));

  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `기존 카테고리 목록: ${JSON.stringify(categories)}\n\n기사:\n${JSON.stringify(input)}`,
      },
    ],
  });

  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
  const parsed = parseResponse(text);
  if (!Array.isArray(parsed)) throw new Error("응답이 배열이 아니에요");

  const allowed = new Set(batch.map((item) => item.url));
  const results: Enriched[] = [];
  for (const row of parsed) {
    if (!row || typeof row !== "object") continue;
    const { url, titleKo, summaryKo, category } = row as Record<string, unknown>;
    if (typeof url !== "string" || !allowed.has(url)) continue;
    if (typeof titleKo !== "string" || !titleKo.trim()) continue;
    if (typeof summaryKo !== "string" || !summaryKo.trim()) continue;
    results.push({
      url,
      titleKo: titleKo.trim(),
      summaryKo: summaryKo.trim(),
      category: cleanCategory(category),
    });
  }
  return results;
}

/**
 * 기사들을 번역·요약·분류한다. 배치 단위로 병렬 호출하며, 실패한 배치의 기사는
 * 결과에서 빠진다(호출하는 쪽에서 url로 매칭해 원문으로 대체).
 */
export async function enrichArticles(
  items: FeedItem[],
  categories: string[],
): Promise<Enriched[]> {
  const batches: FeedItem[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  const settled = await Promise.allSettled(
    batches.map((batch) => enrichBatch(batch, categories)),
  );
  return settled.flatMap((result) => {
    if (result.status === "fulfilled") return result.value;
    console.error("Claude 처리 실패:", result.reason);
    return [];
  });
}
