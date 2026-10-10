import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rotateInviteCode } from "@/api/household";
import { queryKeys } from "@/api/query-keys";

// 초대 코드 재발급 — 되돌릴 수 없음. 응답이 곧 새 코드이므로 캐시에 바로 써넣는다.
export function useRotateInviteCodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdId: string) => rotateInviteCode(householdId),
    onSuccess: (data, householdId) => {
      queryClient.setQueryData(
        queryKeys.household.inviteCode(householdId),
        data,
      );
    },
  });
}
