import { clearAuth } from "@/api/auth";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  AccountDeletionRequest,
  AuthUser,
  ChangePasswordRequest,
} from "@/types/auth";

// me 도메인 (웹 원본 api/meApi.ts)

// §4.4 내 정보 조회
export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>(API_ENDPOINTS.me.base);
  return data;
}

// §4.5 비밀번호 변경. 성공(204) 시 서버가 기존 토큰을 전면 무효화하므로
// 호출부에서 clearAuth() 후 재로그인으로 보낸다. 검증 실패는 ApiHttpError.field_errors 로 온다.
export async function changePassword(
  body: ChangePasswordRequest,
): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.me.password, body);
}

// 회원 탈퇴 DELETE /me — 현재 비밀번호를 바디로 보낸다. 성공(204) 뒤에만 토큰·세션을 지운다
// (실패 시 계정이 남아 있으므로 로그인 유지). member 는 본인만 가구에서 빠지고,
// owner 는 가구가 비활성화되며 기존 member 의 연동도 해제된다 — 화면에서 경고 + 최종 확인.
export async function deleteAccount(
  body: AccountDeletionRequest,
): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.me.base, { data: body });
  await clearAuth();
}
