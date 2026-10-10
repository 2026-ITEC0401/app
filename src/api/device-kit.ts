import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  DeviceKitClaimRequest,
  DeviceKitPreviewResponse,
  DeviceKitResponse,
} from "@/types/device-kit";

// device-kit 도메인 (DEVICE_KIT_API_SPEC). 세 API 모두 가구 ID 경로 + Bearer 토큰.
// 등록 코드는 요청 본문에만 실리고 저장·로그·URL 에 남기지 않는다.

// 명세 "등록 입력" 규칙. 서버와 같은 정규식으로 요청 전에 걸러 불필요한 422 와 입력 제한 소모를 막는다.
export const KIT_ID_PATTERN = /^HEARO-KIT-[A-Z0-9]{4,32}$/;
export const CLAIM_CODE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
export const KIT_ID_MAX_LENGTH = 64;
export const CLAIM_CODE_MAX_LENGTH = 32;

// ASCII 만 허용 (전각 문자 · 유니코드 하이픈은 서버도 거부한다)
const ASCII_ONLY = /^[\x20-\x7E]*$/;

/** 앞뒤 공백 제거 + 대문자 변환. ASCII 가 아니면 null (형식 오류). */
export function normalizeKitInput(value: string): string | null {
  const trimmed = value.trim();
  if (!ASCII_ONLY.test(trimmed)) return null;
  return trimmed.toUpperCase();
}

/** 입력 두 개를 요청 본문으로 정규화한다. 형식이 틀리면 어느 필드인지 돌려준다. */
export function toClaimRequest(
  kitId: string,
  claimCode: string,
): { body: DeviceKitClaimRequest } | { invalid: "kit_id" | "claim_code" } {
  const kit_id = normalizeKitInput(kitId);
  if (!kit_id || !KIT_ID_PATTERN.test(kit_id)) {
    return { invalid: "kit_id" };
  }
  const claim_code = normalizeKitInput(claimCode);
  if (!claim_code || !CLAIM_CODE_PATTERN.test(claim_code)) {
    return { invalid: "claim_code" };
  }
  return { body: { kit_id, claim_code } };
}

// 가구 키트 등록 상태 조회. 앱 진입 · 기기 관리 진입 · 등록 응답 유실 시 복구에 쓴다. 입력 제한에 포함되지 않는다.
export async function getDeviceKit(
  householdId: string,
): Promise<DeviceKitResponse> {
  const { data } = await apiClient.get<DeviceKitResponse>(
    API_ENDPOINTS.deviceKit.status(householdId),
  );
  return data;
}

// 입력한 키트 확인 (owner 전용). DB 변경 없음 — 등록이나 예약이 아니다.
// 확정 요청에서 코드와 권한을 다시 검증하므로 그 사이 다른 가구가 등록하면 확정이 409 로 실패할 수 있다.
export async function previewDeviceKitClaim(
  householdId: string,
  body: DeviceKitClaimRequest,
): Promise<DeviceKitPreviewResponse> {
  const { data } = await apiClient.post<DeviceKitPreviewResponse>(
    API_ENDPOINTS.deviceKit.claimPreview(householdId),
    body,
  );
  return data;
}

// 키트 등록 확정 (owner 전용). 키트 · 가구 · 기기 4대를 한 트랜잭션으로 귀속한다.
// 같은 가구 · 같은 키트 · 올바른 코드의 재전송은 200 으로 현재 등록 결과를 돌려준다 (멱등).
export async function claimDeviceKit(
  householdId: string,
  body: DeviceKitClaimRequest,
): Promise<DeviceKitResponse> {
  const { data } = await apiClient.post<DeviceKitResponse>(
    API_ENDPOINTS.deviceKit.claim(householdId),
    body,
  );
  return data;
}
