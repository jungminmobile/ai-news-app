import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 모든 페이지와 API는 로그인 후에만 사용 가능하다.
// 로그인은 홈(/)의 모달에서 처리하므로, 미로그인 페이지 접근은 /로 보낸다.
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (userId) return;

  const { pathname } = req.nextUrl;
  if (pathname === "/") return;

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/", req.url));
});

export const config = {
  matcher: [
    // Next.js 내부 파일과 정적 파일은 건너뛴다
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api|trpc)(.*)",
  ],
};
