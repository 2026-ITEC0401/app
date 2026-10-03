import { useEffect } from "react";

import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

/**
 * 진입 게이트. 웹의 RequireAuth(토큰 있으면 홈, 없으면 /start) 역할.
 *
 * TODO: 인증 로직은 이번 단계 범위 밖 — 토큰 저장소 연동 시
 * 토큰이 있으면 "/" (홈 탭)으로 보내도록 분기한다.
 */
export default function SplashGate() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return <Redirect href="/start" />;
}
