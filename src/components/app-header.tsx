import { UserButton } from "@clerk/nextjs";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <h1 className="text-lg font-bold tracking-tight">AI 뉴스 수집기</h1>
        <nav className="flex items-center gap-2">
          {/* 가져오기 API(/api/news/fetch)가 아직 없어 비활성 상태 */}
          <button
            type="button"
            disabled
            title="준비 중"
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            뉴스 가져오기
          </button>
          <UserButton />
        </nav>
      </div>
    </header>
  );
}
