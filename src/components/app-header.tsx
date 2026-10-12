import { UserButton } from "@clerk/nextjs";
import { FetchNewsButton } from "./fetch-news-button";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <h1 className="text-lg font-bold tracking-tight">AI 뉴스 수집기</h1>
        <nav className="flex items-center gap-2">
          <FetchNewsButton />
          <UserButton />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
