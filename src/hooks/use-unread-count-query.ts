import { skipToken, useQuery } from "@tanstack/react-query";

import { getUnreadCount } from "@/api/alarm";
import { queryKeys } from "@/api/query-keys";

// 미확인 알림 개수 (홈 배지). 실시간 알림 수신 시 WS 훅이 이 캐시를 +1 한다.
export function useUnreadCountQuery(householdId: string | null) {
  return useQuery({
    queryKey: queryKeys.alarm.unreadCount(householdId ?? ""),
    queryFn: householdId ? () => getUnreadCount(householdId) : skipToken,
  });
}
