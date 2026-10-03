import { skipToken, useQuery } from "@tanstack/react-query";

import { getAlarmDetail } from "@/api/alarm";
import { queryKeys } from "@/api/query-keys";

// §7.4 알림 상세. 없는 알림은 404 → 화면에서 "찾을 수 없어요" 로 분기한다.
export function useAlarmDetailQuery(
  householdId: string | null,
  alarmId: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.alarm.detail(householdId ?? "", alarmId ?? ""),
    queryFn:
      householdId && alarmId
        ? () => getAlarmDetail(householdId, alarmId)
        : skipToken,
  });
}
