import { getAccessToken } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { AlertRealtime } from "@/types/alert";
import type { DeviceId, DeviceUiStatus, RoomDevice } from "@/types/room";
import type {
  HouseholdSocketMessage,
  HouseholdSocketMessageType,
} from "@/types/ws";

// API 와 같은 서버의 wss 엔드포인트. 환경변수 규칙은 api/client.ts 의 API_BASE_URL 과 같다.
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL ?? "";

export interface HouseholdSocketHandlers {
  onAlarm: (alarm: AlertRealtime) => void;
  onDevices: (devices: RoomDevice[]) => void;
  onDeviceStatus: (deviceId: DeviceId, uiStatus: DeviceUiStatus) => void;
}

const KNOWN_TYPES: readonly HouseholdSocketMessageType[] = [
  "alarm.created",
  "connection.ready",
  "device.status_changed",
];

function isHouseholdSocketMessage(
  value: unknown,
): value is HouseholdSocketMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    KNOWN_TYPES.includes(value.type as HouseholdSocketMessageType)
  );
}

/**
 * 가구 실시간 소켓 (웹 원본 lib/ws.ts, 명세 §9).
 * 열리면 access 토큰으로 auth 프레임을 보내고, 알림 생성 · 기기 목록 · 기기 상태 변경을 받는다.
 * RN 의 전역 WebSocket 을 그대로 쓴다. 생명주기(재연결·정리)는 hooks/use-household-socket.ts 가 맡는다.
 */
export function connectHouseholdSocket(
  householdId: string,
  handlers: HouseholdSocketHandlers,
): WebSocket {
  const ws = new WebSocket(
    `${WS_BASE_URL}${API_ENDPOINTS.ws.household(householdId)}`,
  );

  ws.onopen = () => {
    if (__DEV__) console.info("[WS] open");
    // SecureStore 는 비동기라 토큰을 읽는 사이 소켓이 닫혔을 수 있다
    getAccessToken().then((token) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "auth", access_token: token }));
      }
    });
  };

  ws.onmessage = (event) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(String(event.data));
    } catch {
      return; // JSON 이 아닌 프레임은 무시 (§10.8)
    }
    if (!isHouseholdSocketMessage(parsed)) return;

    switch (parsed.type) {
      case "alarm.created":
        handlers.onAlarm(parsed.alarm);
        break;
      case "connection.ready":
        handlers.onDevices(parsed.devices);
        break;
      case "device.status_changed":
        handlers.onDeviceStatus(parsed.device_id, parsed.ui_status);
        break;
    }
  };

  // RN 의 error 이벤트 타입에는 상세가 없다. 원인은 곧 이어지는 close 코드로 본다.
  ws.onerror = () => {
    if (__DEV__) console.info("[WS] error");
  };

  ws.onclose = (event) => {
    if (__DEV__) console.info(`[WS] close ${event.code} ${event.reason}`);
  };

  return ws;
}
