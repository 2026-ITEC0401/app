import {
  apiClient,
  clearTokens,
  getRefreshToken,
  setTokens,
} from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { clearDeviceKitDraft } from "@/stores/device-kit-claim";
import { clearSession, setHouseholdId } from "@/stores/session";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import type { SignupRequest, SignupResponse } from "@/types/signup";

// auth 도메인 단일 호출 함수 (웹 원본 api/authApi.ts). 토큰 저장까지 여기서 끝낸다.

// 로그인 §4.2: 토큰은 바디로 온다. 가구가 연동돼 있으면 household_id 도 세션에 올린다.
// 미연동(household_link_status !== "linked") 분기는 화면에서 응답을 보고 처리한다.
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    API_ENDPOINTS.auth.login,
    body,
  );
  await setTokens(data.tokens.access_token, data.tokens.refresh_token);
  if (data.user.household_link_status === "linked" && data.user.household_id) {
    await setHouseholdId(data.user.household_id);
  }
  return data;
}

// 회원가입 §4.1: 응답 구조는 로그인과 같다. 신규 가구는 household_id 가 바로 오고,
// 가족·보호자는 초대 코드로 연동하기 전까지 null 이다.
// 신규 가구 응답의 device_credentials 는 저장 금지 대상이라 타입에서도 제외돼 있다.
export async function signup(body: SignupRequest): Promise<SignupResponse> {
  const { data } = await apiClient.post<SignupResponse>(
    API_ENDPOINTS.auth.signup,
    body,
  );
  await setTokens(data.tokens.access_token, data.tokens.refresh_token);
  if (data.user.household_id) {
    await setHouseholdId(data.user.household_id);
  }
  return data;
}

// 로그아웃 §4.3: refresh 토큰 폐기. 서버 폐기가 실패해도 로컬 세션은 반드시 정리한다.
export async function logout(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await apiClient.post(API_ENDPOINTS.auth.logout, {
        refresh_token: refreshToken,
      });
    }
  } finally {
    await clearAuth();
  }
}

/**
 * 토큰 + 가구 세션 일괄 정리 (웹 원본 lib/auth.ts clearAuth). 비밀번호 변경 후 재로그인 유도 등.
 * 입력 중이던 키트 등록 코드도 메모리에서 지운다 (명세: 로그아웃 시 제거).
 */
export async function clearAuth(): Promise<void> {
  clearDeviceKitDraft();
  await Promise.all([clearTokens(), clearSession()]);
}
