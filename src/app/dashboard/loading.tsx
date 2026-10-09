import { AppHeader } from "@/components/app-header";

export default function DashboardLoading() {
  return (
    <>
      <AppHeader />
      <main aria-busy="true" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <span className="sr-only" role="status">
          뉴스를 불러오는 중…
        </span>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li
              key={i}
              className="flex animate-pulse flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-gray-800" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-gray-800" />
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-gray-800" />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
