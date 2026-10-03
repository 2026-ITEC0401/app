import { useEffect, useState } from "react";

import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { getAccessToken } from "@/api/client";
import { hydrateSession } from "@/stores/session";

type GateState = "checking" | "signedIn" | "signedOut";

/**
 * 진입 게이트 (웹 원본 components/RequireAuth.tsx 역할).
 * 저장된 access 토큰이 있으면 홈 탭, 없으면 시작 화면으로 보낸다.
 * 가구 식별자(session)는 화면들이 동기로 읽으므로 분기 전에 먼저 복원해 둔다.
 * 토큰이 만료돼 있어도 여기서는 판단하지 않는다 — 첫 요청의 401 을 api/client.ts 가 재발급으로 처리한다.
 */
export default function SplashGate() {
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await hydrateSession();

      let token: string | null = null;
      try {
        token = await getAccessToken();
      } catch (error) {
        console.warn("토큰을 읽지 못했습니다. 시작 화면으로 보냅니다.", error);
      }

      if (!cancelled) {
        setState(token ? "signedIn" : "signedOut");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state !== "checking") {
      SplashScreen.hideAsync();
    }
  }, [state]);

  if (state === "checking") {
    return null;
  }

  return <Redirect href={state === "signedIn" ? "/(main)" : "/start"} />;
}
