import { router, type Href } from "expo-router";

/**
 * 스택을 전부 비우고 href 로 교체한다. 인증 경계를 넘나드는 이동에 쓴다.
 * replace 만 하면 이전 화면들이 스택에 남아 Android 뒤로가기로 되돌아가 버린다
 * (홈 → 시작 화면, 로그아웃 후 → 설정 탭 등).
 */
export function resetTo(href: Href): void {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(href);
}

/** 인증 플로우(시작 → 로그인/가입 → 초대·주소)를 끝내고 홈으로. 게이트("/")가 홈 탭으로 보낸다. */
export function resetToHome(): void {
  resetTo("/");
}

/** 로그아웃 · 회원 탈퇴 후 시작 화면(로그인/회원가입 선택)으로. */
export function resetToStart(): void {
  resetTo("/start");
}
