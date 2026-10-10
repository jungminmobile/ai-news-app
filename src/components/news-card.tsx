import { DeleteArticleButton } from "@/components/delete-article-button";
import { SaveToNotionButton } from "@/components/save-to-notion-button";
import type { Article } from "@/db/schema";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(date: Date) {
  // "2026. 10. 07." → "2026.10.07"
  return dateFormat.format(date).replace(/\.\s/g, ".").replace(/\.$/, "");
}

const buttonBase =
  "flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

export function NewsCard({
  article,
  categoryName,
  notionSaved,
}: {
  article: Article;
  categoryName: string | null;
  notionSaved: boolean;
}) {
  const date = article.publishedAt ?? article.savedAt;

  return (
    <li className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 ease-out hover:border-indigo-200 hover:shadow-md focus-within:border-indigo-200 motion-reduce:transition-none dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-900 dark:focus-within:border-indigo-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        {categoryName ? (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {categoryName}
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            미분류
          </span>
        )}
        <DeleteArticleButton articleId={article.id} />
      </div>

      <h2 className="line-clamp-2 break-keep text-[17px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-indigo-700 dark:text-slate-50 dark:group-hover:text-indigo-300">
        {article.titleKo}
      </h2>
      <p className="mt-2.5 line-clamp-4 break-keep text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {article.summaryKo}
      </p>

      <div className="mt-auto pt-4">
        <p className="mb-3 flex items-baseline justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-gray-800 dark:text-slate-400">
          <span className="truncate font-medium text-slate-700 dark:text-slate-300">
            {article.source}
          </span>
          <time dateTime={date.toISOString()} className="shrink-0 tabular-nums">
            {formatDate(date)}
          </time>
        </p>
        <div className="flex gap-2">
          <SaveToNotionButton articleId={article.id} initialSaved={notionSaved} />
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonBase} border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800`}
          >
            원문보기
          </a>
        </div>
      </div>
    </li>
  );
}
