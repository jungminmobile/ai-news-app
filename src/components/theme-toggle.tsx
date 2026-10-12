"use client";

import { THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // 저장소를 쓸 수 없으면 이번 화면에만 적용한다.
    }
  }

  // 아이콘·라벨은 html.dark 클래스로 전환해 서버/클라이언트 렌더 결과를 같게 유지한다.
  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800 ${className}`}
    >
      <span className="dark:hidden">
        <MoonIcon />
        <span className="sr-only">다크 모드로 전환</span>
      </span>
      <span className="hidden dark:inline">
        <SunIcon />
        <span className="sr-only">라이트 모드로 전환</span>
      </span>
    </button>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px]"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px]"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
