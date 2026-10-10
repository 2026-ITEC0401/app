import { useEffect, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";

import type { DevicesResponse } from "@/api/device";
import { queryKeys } from "@/api/query-keys";
import { connectHouseholdSocket } from "@/api/ws";
import type { AlertWebData, UnreadCountResponse } from "@/types/alert";
import { toWebDataFromRealtime } from "@/utils/alert-mapper";

type Options = {
  /** alarm.created 수신 시 (전체 화면 알림 · 홈 목록용). 바뀌어도 재연결하지 않는다. */
  onAlarm?: (alarm: AlertWebData) => void;
};

/**
 * 가구 실시간 소켓 구독 (웹 원본 MainPage · DeviceListPage · DeviceSettingPage 의 connectWs).
 *
 * 웹은 화면마다 소켓을 열었지만 여기서는 홈(항상 마운트된 탭)에서 한 번만 열고,
 * 수신한 기기 목록·상태를 react-query 캐시에 써넣어 기기 관리·기기 상세가 같은 데이터를 보게 한다.
 * 알림 수신 시 미확인 개수 캐시를 +1 한다 (같은 알림 중복 수신은 한 번만).
 *
 * 앱이 백그라운드에 가면 OS 가 소켓을 끊을 수 있어 포그라운드 복귀 시 닫혀 있으면 다시 연다.
 */
export function useHouseholdSocket(
  householdId: string | null,
  { onAlarm }: Options = {},
) {
  const queryClient = useQueryClient();
  const onAlarmRef = useRef(onAlarm);

  useEffect(() => {
    onAlarmRef.current = onAlarm;
  }, [onAlarm]);

  useEffect(() => {
    if (!householdId) return;

    const devicesKey = queryKeys.device.list(householdId);
    const unreadKey = queryKeys.alarm.unreadCount(householdId);
    // WS 로 이미 +1 한 알림 id — 동일 알림 중복 수신 시 이중 카운트 방지
    const countedAlarmIds = new Set<string>();
    let socket: WebSocket | null = null;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      socket = connectHouseholdSocket(householdId, {
        onAlarm: (alarm) => {
          if (!countedAlarmIds.has(alarm.id)) {
            countedAlarmIds.add(alarm.id);
            queryClient.setQueryData<UnreadCountResponse>(unreadKey, (old) =>
              old ? { ...old, unread_count: old.unread_count + 1 } : old,
            );
          }
          onAlarmRef.current?.(toWebDataFromRealtime(alarm));
        },
        onDevices: (devices) => {
          queryClient.setQueryData<DevicesResponse>(devicesKey, { devices });
        },
        onDeviceStatus: (deviceId, uiStatus) => {
          queryClient.setQueryData<DevicesResponse>(devicesKey, (old) =>
            old
              ? {
                  devices: old.devices.map((d) =>
                    d.device_id === deviceId
                      ? { ...d, ui_status: uiStatus }
                      : d,
                  ),
                }
              : old,
          );
        },
      });
    };

    connect();

    const subscription = AppState.addEventListener("change", (state) => {
      const closed =
        !socket ||
        socket.readyState === WebSocket.CLOSING ||
        socket.readyState === WebSocket.CLOSED;
      if (state === "active" && closed) {
        connect();
      }
    });

    return () => {
      disposed = true;
      subscription.remove();
      socket?.close();
    };
  }, [householdId, queryClient]);
}
