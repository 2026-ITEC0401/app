import type { AlertHistoryResponse, AlertWebData } from "@/types/alert";

// 화면 골격용 더미 데이터. API 연동 시 이 파일만 지우면 되도록 여기에 격리한다.

/** 홈 "실시간 소리 알림" 목록 + 상세 조회용 */
export const MOCK_ALERTS: AlertWebData[] = [
  {
    id: "alarm-001",
    display_time: "오전 08:47",
    date: "2026-10-03",
    local_time: "2026-10-03T08:47:00+09:00",
    location: "거실",
    sound: "화재 경보",
    raw_label: "fire_alarm",
    type: "Urgent",
    source_device_id: "rpi-001",
  },
  {
    id: "alarm-002",
    display_time: "오전 07:30",
    date: "2026-10-03",
    local_time: "2026-10-03T07:30:00+09:00",
    location: "현관",
    sound: "초인종",
    raw_label: "doorbell",
    type: "Visitor",
    source_device_id: "esp32_2",
  },
  {
    id: "alarm-003",
    display_time: "오후 11:12",
    date: "2026-10-02",
    local_time: "2026-10-02T23:12:00+09:00",
    location: "안방",
    sound: "아기 울음",
    raw_label: "baby_cry",
    type: "Noise",
    source_device_id: "esp32_1",
  },
];

export function findMockAlert(id: string): AlertWebData | undefined {
  return MOCK_ALERTS.find((alert) => alert.id === id);
}

/** 알람 탭 — 최근 7일 날짜별 이력 (명세 §7.3) */
export const MOCK_ALERT_HISTORY: AlertHistoryResponse = {
  timezone: "Asia/Seoul",
  start_date: "2026-09-27",
  end_date: "2026-10-03",
  total_count: 5,
  days: [
    {
      date: "2026-10-03",
      display_label: "오늘",
      alarms: [
        {
          id: "alarm-001",
          time: "2026-10-02T23:47:00Z",
          local_time: "2026-10-03T08:47:00+09:00",
          location: "거실",
          sound: "화재 경보",
          raw_label: "fire_alarm",
          type: "Urgent",
          source_device_id: "rpi-001",
          confidence: 0.97,
        },
        {
          id: "alarm-002",
          time: "2026-10-02T22:30:00Z",
          local_time: "2026-10-03T07:30:00+09:00",
          location: "현관",
          sound: "초인종",
          raw_label: "doorbell",
          type: "Visitor",
          source_device_id: "esp32_2",
          confidence: 0.91,
        },
      ],
    },
    {
      date: "2026-10-02",
      display_label: "어제",
      alarms: [
        {
          id: "alarm-003",
          time: "2026-10-02T14:12:00Z",
          local_time: "2026-10-02T23:12:00+09:00",
          location: "안방",
          sound: "아기 울음",
          raw_label: "baby_cry",
          type: "Noise",
          source_device_id: "esp32_1",
          confidence: 0.88,
        },
      ],
    },
    {
      date: "2026-10-01",
      display_label: null,
      alarms: [],
    },
    {
      date: "2026-09-30",
      display_label: null,
      alarms: [
        {
          id: "alarm-004",
          time: "2026-09-30T09:05:00Z",
          local_time: "2026-09-30T18:05:00+09:00",
          location: "현관",
          sound: "노크",
          raw_label: "knock",
          type: "Visitor",
          source_device_id: "esp32_2",
          confidence: 0.84,
        },
        {
          id: "alarm-005",
          time: "2026-09-30T03:20:00Z",
          local_time: "2026-09-30T12:20:00+09:00",
          location: "화장실",
          sound: "물 흐르는 소리",
          raw_label: "water_running",
          type: "Noise",
          source_device_id: "esp32_3",
          confidence: 0.79,
        },
      ],
    },
  ],
};

export const MOCK_UNREAD_COUNT = 3;
