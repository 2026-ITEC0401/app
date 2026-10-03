import { skipToken, useQuery } from "@tanstack/react-query";

import { getAlarmHistory } from "@/api/alarm";
import { queryKeys } from "@/api/query-keys";

// §7.3 최근 7일 알림 이력 (알람 탭)
export function useAlarmHistoryQuery(householdId: string | null) {
  return useQuery({
    queryKey: queryKeys.alarm.history(householdId ?? ""),
    queryFn: householdId ? () => getAlarmHistory(householdId) : skipToken,
  });
}
