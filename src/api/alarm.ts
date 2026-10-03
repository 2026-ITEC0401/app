import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  AlertDetailResponse,
  AlertHistoryResponse,
  AlertLatestResponse,
  SeenResponse,
  UnreadCountResponse,
} from "@/types/alert";

// alarm 도메인 (웹 원본 api/alarmApi.ts)

// §7.2 최근 알림 1건 (없으면 alarm: null)
export async function getLatestAlarm(
  householdId: string,
): Promise<AlertLatestResponse> {
  const { data } = await apiClient.get<AlertLatestResponse>(
    API_ENDPOINTS.alarm.latest(householdId),
  );
  return data;
}

// §7.3 최근 7일 날짜별 알림. 알림이 없는 날짜도 빈 배열로 온다.
export async function getAlarmHistory(
  householdId: string,
): Promise<AlertHistoryResponse> {
  const { data } = await apiClient.get<AlertHistoryResponse>(
    API_ENDPOINTS.alarm.history(householdId),
  );
  return data;
}

// §7.4 알림 상세. 없으면 404.
export async function getAlarmDetail(
  householdId: string,
  alarmId: string,
): Promise<AlertDetailResponse> {
  const { data } = await apiClient.get<AlertDetailResponse>(
    API_ENDPOINTS.alarm.detail(householdId, alarmId),
  );
  return data;
}

// 미확인 알림 개수 (홈 배지)
export async function getUnreadCount(
  householdId: string,
): Promise<UnreadCountResponse> {
  const { data } = await apiClient.get<UnreadCountResponse>(
    API_ENDPOINTS.alarm.unreadCount(householdId),
  );
  return data;
}

// 모두 확인 처리. 요청 바디 없음 — 서버가 처리 시각을 last_seen_at 으로 저장한다.
export async function markAlarmsSeen(
  householdId: string,
): Promise<SeenResponse> {
  const { data } = await apiClient.patch<SeenResponse>(
    API_ENDPOINTS.alarm.seen(householdId),
  );
  return data;
}
