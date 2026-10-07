import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AutoSignIn } from "@/components/auto-sign-in";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <>
      <AutoSignIn />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          AI 뉴스 수집기
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          해외 AI 뉴스를 한국어로 번역·요약해 보여줍니다. 로그인 후 사용할 수
          있습니다.
        </p>
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <button className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
            로그인
          </button>
        </SignInButton>
      </main>
    </>
  );
}
