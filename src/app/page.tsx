import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { AutoSignIn } from "@/components/auto-sign-in";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <AutoSignIn />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            AI 뉴스 수집기
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            해외 AI 뉴스를 한국어로 번역·요약해 보여줍니다. 로그인 후 사용할 수
            있습니다.
          </p>
          <SignInButton mode="modal">
            <button className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              로그인
            </button>
          </SignInButton>
        </main>
      </Show>
      <Show when="signed-in">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <span className="font-semibold">AI 뉴스 수집기</span>
          <UserButton />
        </header>
        <main className="flex-1 px-6 py-8">
          <p className="text-zinc-600 dark:text-zinc-400">
            로그인되었습니다.
          </p>
        </main>
      </Show>
    </>
  );
}
