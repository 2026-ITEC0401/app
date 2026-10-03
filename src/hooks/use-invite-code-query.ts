import { skipToken, useQuery } from "@tanstack/react-query";

import { getInviteCode } from "@/api/household";
import { queryKeys } from "@/api/query-keys";

// §5.2 초대 코드 (owner 전용). 모달이 열렸을 때만 조회한다.
export function useInviteCodeQuery(
  householdId: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.household.inviteCode(householdId ?? ""),
    queryFn:
      householdId && enabled ? () => getInviteCode(householdId) : skipToken,
  });
}
