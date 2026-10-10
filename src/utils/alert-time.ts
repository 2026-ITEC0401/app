import { type AlertWebData } from "@/types/alert";

// 명세 §7.3 local_time("2026-07-08T08:47:00+09:00")은 이미 Asia/Seoul 벽시계 값이므로
// Date로 변환하지 않고 문자열 그대로 읽는다. (기기 타임존에 따라 밀리는 것을 방지)
const LOCAL_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

export interface AlertTimeParts {
  date: string; // 상세 화면 날짜 행 "2026/07/08"
  meridiem: string; // "오전" | "오후"
  clock: string; // "08:47"
  stamp: string; // 119 문자 템플릿용 "2026-07-08 08:47"
}

export function toAlertTimeParts(alert: AlertWebData): AlertTimeParts {
  const matched = alert.local_time?.match(LOCAL_TIME_PATTERN);

  if (matched) {
    const [, year, month, day, hour, minute] = matched;
    const hour24 = Number(hour);
    const hour12 = hour24 % 12 || 12;
    // 명세 §7.3 date가 있으면 그 값을, 없으면 local_time에서 뽑아 쓴다
    const isoDate = alert.date ?? `${year}-${month}-${day}`;

    return {
      date: isoDate.replace(/-/g, "/"),
      meridiem: hour24 < 12 ? "오전" : "오후",
      clock: `${String(hour12).padStart(2, "0")}:${minute}`,
      stamp: `${isoDate} ${hour}:${minute}`,
    };
  }

  // local_time이 없는 경우 카드용 표시 문자열("오전 08:47")로 대체
  const [meridiem, clock] = alert.display_time.split(" ");
  const isoDate = alert.date ?? "";
  return {
    date: isoDate ? isoDate.replace(/-/g, "/") : "-",
    meridiem: clock ? meridiem : "시각",
    clock: clock ?? alert.display_time,
    stamp: `${isoDate} ${alert.display_time}`.trim(),
  };
}
