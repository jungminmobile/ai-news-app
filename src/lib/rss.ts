import { XMLParser } from "fast-xml-parser";

export const FEEDS = [
  {
    source: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    source: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
] as const;

export type FeedItem = {
  url: string;
  source: string;
  titleEn: string;
  summary: string;
  publishedAt: Date;
};

const WINDOW_MS = 23 * 60 * 60 * 1000;
const MAX_PER_FEED = 10;
const MAX_SUMMARY_LENGTH = 300;
const FETCH_TIMEOUT_MS = 10_000;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: true,
});

// 파서 결과는 노드가 하나면 객체, 여러 개면 배열이라 항상 배열로 맞춘다.
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

// 텍스트 노드는 문자열이거나 { "#text": ... } 형태일 수 있다.
function text(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (node && typeof node === "object" && "#text" in node) {
    return text((node as Record<string, unknown>)["#text"]);
  }
  return "";
}

// 일부 피드는 &#8217; 같은 숫자 엔티티가 파서 이후에도 남아 있어 직접 풀어 준다.
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string): string {
  return s.length > MAX_SUMMARY_LENGTH
    ? `${s.slice(0, MAX_SUMMARY_LENGTH).trimEnd()}…`
    : s;
}

// Atom의 <link>는 href 속성, RSS 2.0의 <link>는 텍스트다.
function atomLink(link: unknown): string {
  const links = toArray<Record<string, string> | string>(
    link as Record<string, string> | string | undefined,
  );
  for (const l of links) {
    if (typeof l === "string") return l.trim();
    const rel = l["@_rel"];
    if (!rel || rel === "alternate") return (l["@_href"] ?? "").trim();
  }
  return "";
}

function parseItems(xml: string, source: string): FeedItem[] {
  const doc = parser.parse(xml);
  const raw: Record<string, unknown>[] = doc.rss
    ? toArray(doc.rss.channel?.item)
    : toArray(doc.feed?.entry);

  const items: FeedItem[] = [];
  for (const entry of raw) {
    const url = doc.rss ? text(entry.link).trim() : atomLink(entry.link);
    const titleEn = stripHtml(text(entry.title));
    const dateStr = doc.rss
      ? text(entry.pubDate)
      : text(entry.published) || text(entry.updated);
    const publishedAt = new Date(dateStr);
    if (!url || !titleEn || Number.isNaN(publishedAt.getTime())) continue;

    const summaryRaw = doc.rss
      ? text(entry.description)
      : text(entry.summary) || text(entry.content);
    items.push({
      url,
      source,
      titleEn,
      summary: truncate(stripHtml(summaryRaw)),
      publishedAt,
    });
  }
  return items;
}

/** 피드 하나를 가져와 최근 23시간 이내 최신 기사만 반환한다. 실패하면 throw. */
export async function fetchFeed(
  feed: { source: string; url: string },
  now = Date.now(),
): Promise<FeedItem[]> {
  const res = await fetch(feed.url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "ai-news-collector/1.0" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${feed.source} RSS 응답 오류: ${res.status}`);

  return parseItems(await res.text(), feed.source)
    .filter((item) => item.publishedAt.getTime() >= now - WINDOW_MS)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, MAX_PER_FEED);
}
