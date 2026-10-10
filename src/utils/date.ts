const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// 명세 §7.3 local_time("2026-07-08T08:47:00+09:00")은 이미 Asia/Seoul 벽시계 값
const LOCAL_TIME_PATTERN = /T(\d{2}):(\d{2})/;

/**
 * 알림 이력의 날짜 묶음 제목을 만든다.
 * 명세 §7.3: 오늘/어제는 서버가 display_label을 내려주고,
 * 나머지 날짜는 null이므로 프론트가 date를 "8월 20일 (목)" 형태로 변환한다.
 */
export function formatAlertDayLabel(
  date: string,
  displayLabel: string | null,
): string {
  if (displayLabel) return displayLabel;

  const [year, month, day] = date.split("-").map(Number);
  // 요일은 기기 시간대의 영향을 받지 않도록 UTC 기준으로 계산한다
  const weekday =
    WEEKDAY_LABELS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];

  return `${month}월 ${day}일 (${weekday})`;
}

/** ISO 시각 → "2026.10.06" (기기 시간대 기준). 가입일 · 키트 등록일 같은 날짜 표시용. */
export function formatDateDots(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

/** 24시 → "오전 08:30" 꼴. 웹의 Intl.DateTimeFormat(ko-KR, hour12) 출력과 같다. */
export function formatClock(hour24: number, minute: number): string {
  const hour12 = hour24 % 12 || 12;
  const meridiem = hour24 < 12 ? "오전" : "오후";
  return `${meridiem} ${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * 서버의 local_time(예: 2026-08-23T08:30:00+09:00)을 "오전 08:30" 문구로 변환한다.
 *
 * 웹은 Intl.DateTimeFormat 을 썼지만, RN(Hermes)의 Intl 지원 범위에 기대지 않도록
 * 이미 Asia/Seoul 벽시계 값인 문자열에서 시·분을 그대로 읽는다.
 */
export function formatAlertTime(localTime: string): string {
  const matched = localTime.match(LOCAL_TIME_PATTERN);
  if (!matched) return "시간 오류";

  return formatClock(Number(matched[1]), Number(matched[2]));
}
