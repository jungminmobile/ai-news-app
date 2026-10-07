"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

// 접속하자마자 로그인 모달을 연다. 로그아웃 상태에서만 렌더링할 것.
export function AutoSignIn() {
  const { loaded, openSignIn } = useClerk();

  useEffect(() => {
    if (loaded) openSignIn();
  }, [loaded, openSignIn]);

  return null;
}
