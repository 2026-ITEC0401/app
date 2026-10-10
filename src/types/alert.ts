import { type DeviceId, type RoomLabel } from "@/types/room";

// 알람 종류 : 방문자 | 화재 | 소음
export type AlertType = "Visitor" | "Urgent" | "Noise";

// 전체 공통 데이터
export interface CommonData {
  location: RoomLabel;
  sound: string;
  raw_label: string | null;
  type: AlertType;
}

// 화면용 데이터
export interface AlertWebData extends CommonData {
  id: string;
  // 카드에 바로 찍는 표시용 시각 ("오전 08:00")
  display_time: string;
  // 명세 §7.4 date (Asia/Seoul 기준 YYYY-MM-DD)
  date?: string;
  // 명세 §7.4 local_time (Asia/Seoul 오프셋 포함 ISO). 오전·오후와 시각의 출처
  local_time?: string;
  // 명세 §7.3 알림을 감지한 기기 (§7.4 상세 응답에는 포함되지 않음)
  source_device_id?: DeviceId;
}

//  §7.1 일반 목록 / §7.2 최근 알림
export interface AlertListItem extends CommonData {
  id: string;
  time: string; // UTC ISO 8601 - 정렬/비교용
  source_device_id: DeviceId;
  confidence: number | null;
}

// §7.3 최근 7일 날짜별 알림 (GET /households/{id}/alarms/history)
export interface AlertHistoryAlarm extends AlertListItem {
  local_time: string; // Asia/Seoul ISO 8601 - 화면 표시용
}

// §7.4 알림 상세
export interface AlertDetail extends CommonData {
  id: string;
  date: string;
  local_time: string;
}

// §9 WebSocket alarm.created
export interface AlertRealtime extends CommonData {
  id: string;
  time: string;
}

export interface AlertHistoryDay {
  // YYYY-MM-DD
  date: string;
  // "오늘" | "어제" | null (null이면 프론트가 date를 변환해 표시)
  display_label: string | null;
  alarms: AlertHistoryAlarm[];
}

export interface AlertHistoryResponse {
  timezone: string;
  start_date: string;
  end_date: string;
  total_count: number;
  days: AlertHistoryDay[];
}

// §7.2 최근 알림 응답
export interface AlertLatestResponse {
  alarm: AlertListItem | null;
}

// 알림 상세 응답 (GET /households/{id}/alarms/{alarm_id})
export interface AlertDetailResponse {
  alarm: AlertDetail;
}

// 미확인 알림 개수 (GET /households/{id}/alarms/unread-count)
export interface UnreadCountResponse {
  unread_count: number;
  last_seen_at: string;
  window_days: number;
}

// 알림 모두 확인 (PATCH /households/{id}/alarms/seen)
export interface SeenResponse {
  unread_count: number;
  last_seen_at: string;
}
