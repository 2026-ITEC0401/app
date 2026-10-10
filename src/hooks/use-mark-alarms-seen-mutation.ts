import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markAlarmsSeen } from "@/api/alarm";
import { queryKeys } from "@/api/query-keys";
import type { UnreadCountResponse } from "@/types/alert";

// 알림 모두 확인 처리. 응답의 unread_count(0) 를 홈 배지 캐시에 바로 반영한다.
export function useMarkAlarmsSeenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdId: string) => markAlarmsSeen(householdId),
    onSuccess: (data, householdId) => {
      queryClient.setQueryData<UnreadCountResponse>(
        queryKeys.alarm.unreadCount(householdId),
        (old) =>
          old
            ? {
                ...old,
                unread_count: data.unread_count,
                last_seen_at: data.last_seen_at,
              }
            : old,
      );
    },
  });
}
