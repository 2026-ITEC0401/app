import { router } from "expo-router";

/**
 * 인증 플로우(시작 → 로그인/가입 → 초대·주소)를 끝내고 홈으로 들어갈 때 쓴다.
 * replace 만 하면 스택에 /start 가 남아 홈에서 Android 뒤로가기를 누르면 시작 화면으로 빠진다.
 * 먼저 스택을 비우고 게이트("/")로 교체해 홈이 유일한 화면이 되게 한다.
 */
export function resetToHome(): void {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace("/");
}
