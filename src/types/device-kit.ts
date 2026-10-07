import type {
  DeviceId,
  DeviceType,
  DeviceUiStatus,
  RoomLabel,
} from "@/types/room";

// 기기 키트 등록 (DEVICE_KIT_API_SPEC). 키트 = Raspberry Pi 1대 + ESP32 3대 한 세트.
// 키트 등록은 "이 키트가 어느 가구의 것인지"를 서버에 기록하는 것이고, 실제 기기 설정은
// 설치 담당자가 하므로 등록 완료(claimed)와 기기 연결(ui_status)은 별개로 취급한다.

// 가구의 키트 등록 상태
// unregistered      : 신규 가구, 키트 미등록 (owner 만 can_claim=true)
// claimed           : 키트가 이 가구에 등록됨
// legacy_registered : 기능 도입 이전의 기존 가구 (키트 번호 없이 기존 기기 기능 계속 사용)
export type DeviceKitStatus = "unregistered" | "claimed" | "legacy_registered";

// GET /households/{id}/device-kit · POST …/device-kit/claim 응답의 기기 항목
export interface DeviceKitDevice {
  device_id: DeviceId;
  device_type: DeviceType;
  location: RoomLabel;
  // 등록된 물리 기기 번호 (예: HR-RPI-0001). 미등록·기존 가구는 null. 표시 전용 — 인증에 쓰지 않는다
  hardware_id: string | null;
  // 기존 /devices 와 같은 계산의 조회 시점 연결 상태
  ui_status: DeviceUiStatus;
  last_seen_at: string | null;
}

// GET /households/{id}/device-kit · POST …/device-kit/claim 응답
export interface DeviceKitResponse {
  household_id: string;
  status: DeviceKitStatus;
  kit_id: string | null;
  claimed_at: string | null;
  // 현재 사용자에게 등록 UI 를 보여줘도 되는지 (권한은 서버가 다시 검증한다)
  can_claim: boolean;
  // 명세 고정 순서 4대 (rpi-001, esp32_1, esp32_2, esp32_3). 대응은 항상 device_id 로.
  devices: DeviceKitDevice[];
}

// POST …/device-kit/claim/preview · POST …/device-kit/claim 공통 요청 본문
// kit_id: `^HEARO-KIT-[A-Z0-9]{4,32}$`, claim_code: `^[A-Z0-9]{4}-[A-Z0-9]{4}$` (trim · 대문자 변환 후)
export interface DeviceKitClaimRequest {
  kit_id: string;
  claim_code: string;
}

// POST …/device-kit/claim/preview 응답의 기기 항목. 미리보기는 등록이 아니라 상태가 없다.
export interface DeviceKitPreviewDevice {
  device_id: DeviceId;
  device_type: DeviceType;
  location: RoomLabel;
  hardware_id: string;
}

// POST …/device-kit/claim/preview 응답. 등록할 수 없으면 200 이 아니라 공통 오류로 온다.
export interface DeviceKitPreviewResponse {
  claimable: true;
  kit_id: string;
  devices: DeviceKitPreviewDevice[];
}
