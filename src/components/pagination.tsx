import Link from "next/link";

const base =
  "inline-flex min-w-9 items-center justify-center rounded-lg px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const selectedCls = "bg-indigo-600 font-medium text-white";
const defaultCls =
  "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800";
const disabledCls =
  "cursor-not-allowed border border-slate-200 text-slate-500 opacity-40 dark:border-gray-700 dark:text-slate-400";

// 현재 페이지 주변만 보여 주고 나머지는 생략(…)한다.
function pageList(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지 이동" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${base} ${defaultCls}`}>
          이전
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} ${disabledCls}`}>
          이전
        </span>
      )}
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-slate-500">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? selectedCls : defaultCls}`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={`${base} ${defaultCls}`}>
          다음
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} ${disabledCls}`}>
          다음
        </span>
      )}
    </nav>
  );
}
