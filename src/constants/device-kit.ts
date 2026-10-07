import { ApiHttpError, getApiErrorMessage } from "@/api/http-error";
import { Palette } from "@/constants/theme";
import type { DeviceKitStatus } from "@/types/device-kit";
import type { DeviceType, DeviceUiStatus } from "@/types/room";

// 명세 "키트 등록 상태" 표의 화면 표시
export const kitStatusLabel: Record<DeviceKitStatus, string> = {
  unregistered: "키트 미등록",
  claimed: "키트 등록 완료",
  legacy_registered: "등록 완료",
};

// 기기 종류 표시. 키트 = 허브(Raspberry Pi) 1대 + 알림 기기(ESP32) 3대
export const deviceTypeLabel: Record<DeviceType, string> = {
  hub: "허브 · Raspberry Pi",
  alert_node: "알림 기기 · ESP32",
};

/**
 * 등록 결과 화면의 기기 연결 표시.
 * 등록 직후엔 기기가 전부 offline 인 게 정상이고(설치 담당자가 설정하기 전), 사용자에게는
 * "오프라인"보다 "연결 대기"가 맞는 설명이라 connected 가 아닌 상태를 묶어서 보여준다.
 * (기기 관리 화면의 세부 상태 라벨은 constants/room.ts 의 deviceStatusMeta 가 그대로 맡는다)
 */
export function kitDeviceConnectionMeta(status: DeviceUiStatus): {
  label: string;
  dotColor: string;
} {
  return status === "connected"
    ? { label: "연결됨", dotColor: Palette.success }
    : { label: "연결 대기", dotColor: Palette.gray[200] };
}

// 명세 "프론트 처리 순서" 7항의 완료 문구
export const KIT_CLAIMED_TITLE = "키트 등록이 완료되었습니다.";
export const KIT_CLAIMED_DESCRIPTION =
  "기기 설정이 완료되면\n연결 상태를 확인할 수 있습니다.";

// 명세 "오류 응답" 표 → 사용자 문구. 서버 메시지보다 앱 톤에 맞춘 문구를 우선한다.
const KIT_ERROR_MESSAGES: Partial<Record<string, string>> = {
  INVALID_KIT_CREDENTIALS:
    "키트 ID 또는 등록 코드가 맞지 않아요. 두 값을 함께 확인해 주세요.",
  OWNER_REQUIRED: "키트 등록은 가구 소유자만 할 수 있어요.",
  HOUSEHOLD_ACCESS_DENIED: "이 가구에 접근할 수 없어요.",
  HOUSEHOLD_LINK_REQUIRED: "가구 연동이 필요해요.",
  HOUSEHOLD_INACTIVE: "가구가 비활성화되어 등록할 수 없어요.",
  KIT_ALREADY_CLAIMED: "다른 가구에서 사용 중인 키트예요.",
  HOUSEHOLD_ALREADY_HAS_KIT: "이 가구에는 이미 등록된 키트가 있어요.",
  KIT_CONFIGURATION_INVALID:
    "키트 구성에 문제가 있어요. 설치 담당자에게 문의해 주세요.",
  KIT_CLAIM_CONFLICT:
    "등록 중 가구 상태가 바뀌었어요. 잠시 후 다시 확인해 주세요.",
  VALIDATION_ERROR: "입력 형식을 확인해 주세요.",
  KIT_CLAIM_RATE_LIMITED:
    "입력 횟수가 너무 많아요. 잠시 후 다시 시도해 주세요.",
  KIT_SERVICE_UNAVAILABLE: "일시적인 오류예요. 잠시 후 다시 시도해 주세요.",
};

// 경로 자체가 없음 = 신규 API 미배포 (명세: 배포 전에는 이 경로가 존재하지 않는다). 토스트 두 줄.
export const KIT_UNAVAILABLE_NOTICE =
  "키트 등록 기능을 아직 사용할 수 없어요.\n잠시 후 다시 시도해 주세요.";

/** 키트 API 가 아직 서버에 없는 경우(404). 입력 화면은 이 때 토스트를 띄우고 이전 화면으로 돌아간다. */
export function isKitApiUnavailable(error: unknown): boolean {
  return error instanceof ApiHttpError && error.status === 404;
}

/** 키트 API 오류 → 화면 문구. 코드 매핑 → 미배포 안내 → 서버 메시지 → fallback 순. */
export function getKitErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiHttpError) {
    const mapped = KIT_ERROR_MESSAGES[error.code];
    if (mapped) return mapped;
    if (isKitApiUnavailable(error)) return KIT_UNAVAILABLE_NOTICE;
  }
  return getApiErrorMessage(error, fallback);
}

/**
 * 확정 요청의 응답을 못 받은 경우(통신 단절 · 503). 명세: 실패로 확정하지 말고
 * GET 으로 서버 상태를 먼저 조회해 같은 키트가 등록돼 있으면 완료 화면을 보여준다.
 */
export function isClaimOutcomeUnknown(error: unknown): boolean {
  return (
    error instanceof ApiHttpError &&
    (error.code === "NETWORK_ERROR" || error.status === 503)
  );
}
