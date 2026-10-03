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
}
