import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { AuthUser, ChangePasswordRequest } from "@/types/auth";

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
