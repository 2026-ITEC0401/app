import { create } from "zustand";

import type {
  DeviceKitClaimRequest,
  DeviceKitPreviewResponse,
} from "@/types/device-kit";

/**
 * 키트 등록 진행 중 데이터 (입력 화면 → 확인 화면).
 *
 * 등록 코드는 명세상 URL · 저장소 · 로그에 남기면 안 되므로 expo-router 파라미터 대신
 * 메모리(zustand)에만 둔다. 등록 성공 · 흐름 이탈 · 로그아웃 시 clearDeviceKitDraft() 로 지운다.
 * 미리보기 결과도 같이 들고 있어 확인 화면이 다시 조회하지 않는다 (입력 제한에 합산되는 호출).
 */
interface DeviceKitDraft {
  request: DeviceKitClaimRequest;
  preview: DeviceKitPreviewResponse;
}

interface DeviceKitClaimState {
  draft: DeviceKitDraft | null;
}

export const useDeviceKitClaimStore = create<DeviceKitClaimState>(() => ({
  draft: null,
}));

export function setDeviceKitDraft(draft: DeviceKitDraft): void {
  useDeviceKitClaimStore.setState({ draft });
}

export function clearDeviceKitDraft(): void {
  useDeviceKitClaimStore.setState({ draft: null });
}

export function useDeviceKitDraft(): DeviceKitDraft | null {
  return useDeviceKitClaimStore((state) => state.draft);
}
