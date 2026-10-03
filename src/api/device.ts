import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { RoomDevice } from "@/types/room";

// device 도메인 (웹 원본 api/deviceApi.ts)

export interface DevicesResponse {
  devices: RoomDevice[];
}

// §6.1 기기 목록. 단건 조회 API 가 없어 상세 화면도 목록에서 대상 기기를 추출한다.
export async function getDevices(
  householdId: string,
): Promise<DevicesResponse> {
  const { data } = await apiClient.get<DevicesResponse>(
    API_ENDPOINTS.device.list(householdId),
  );
  return data;
}

// §6.2 MQTT 연결 켜기/끄기 (owner 전용). 응답 스키마가 명세에 없어 바디에 의존하지 않는다.
// 호출부에서 재조회(getDevices)와 WS device.status_changed 로 상태를 확정한다.
export async function setConnection(
  householdId: string,
  deviceId: string,
  enabled: boolean,
): Promise<void> {
  await apiClient.patch(
    API_ENDPOINTS.device.connection(householdId, deviceId),
    {
      enabled,
    },
  );
}

// §6.3 LED 알림 켜기/끄기 (owner 전용)
export async function setLedAlert(
  householdId: string,
  deviceId: string,
  ledAlertEnabled: boolean,
): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.device.settings(householdId, deviceId), {
    led_alert_enabled: ledAlertEnabled,
  });
}
