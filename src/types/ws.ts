import type { AlertRealtime } from "@/types/alert";
import type { DeviceId, DeviceUiStatus, RoomDevice } from "@/types/room";

// 명세 §9 가구 WebSocket 수신 프레임. 그 외 타입은 무시한다 (§10.8).
export type HouseholdSocketMessage =
  | { type: "alarm.created"; alarm: AlertRealtime }
  | { type: "connection.ready"; devices: RoomDevice[] }
  | {
      type: "device.status_changed";
      device_id: DeviceId;
      ui_status: DeviceUiStatus;
    };

export type HouseholdSocketMessageType = HouseholdSocketMessage["type"];
