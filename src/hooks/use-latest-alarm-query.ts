import { skipToken, useQuery } from "@tanstack/react-query";

import { getLatestAlarm } from "@/api/alarm";
import { queryKeys } from "@/api/query-keys";

// §7.2 최근 알림 1건 (홈 "실시간 소리 알림" 목록의 초기값)
export function useLatestAlarmQuery(householdId: string | null) {
  return useQuery({
    queryKey: queryKeys.alarm.latest(householdId ?? ""),
    queryFn: householdId ? () => getLatestAlarm(householdId) : skipToken,
  });
}
