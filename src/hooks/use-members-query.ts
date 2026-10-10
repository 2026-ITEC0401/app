import { skipToken, useQuery } from "@tanstack/react-query";

import { getMembers } from "@/api/household";
import { queryKeys } from "@/api/query-keys";

// §5.5 가족 구성원. 가족 설정과 긴급 알림 액션(가족 전화번호)이 공유한다.
export function useMembersQuery(householdId: string | null) {
  return useQuery({
    queryKey: queryKeys.household.members(householdId ?? ""),
    queryFn: householdId ? () => getMembers(householdId) : skipToken,
  });
}
