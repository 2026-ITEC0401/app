import type { LoginResponse } from "@/types/auth";

export type SignupType = "new_household" | "family_member";

// 응답 구조는 로그인과 동일 (user + tokens)
// 신규 가구 응답의 device_credentials는 저장 금지 대상이라 타입에서 제외 (§4.1)
export type SignupResponse = LoginResponse;

// 명세 §4 인증 및 회원가입
export interface SignupRequest {
  login_id: string;
  name: string;
  phone_number: string;
  password: string;
  signup_type: SignupType;
  household_name?: string; // new_household일 때만
  terms_service_agreed: boolean;
  privacy_agreed: boolean;
  // 만 14세 이상 확인 (개인정보 처리방침 제11조). 백엔드에 추가 요청한 필드 — false 면 422.
  age_over_14_agreed: boolean;
}
