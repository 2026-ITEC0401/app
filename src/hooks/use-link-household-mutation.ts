import { useMutation, useQueryClient } from "@tanstack/react-query";

import { link } from "@/api/household";
import { queryKeys } from "@/api/query-keys";
import { setHouseholdId } from "@/stores/session";

// §5.4 가구 연동. 성공 시 household_id 를 세션에 올리고 가구 관련 캐시를 무효화한다.
export function useLinkHouseholdMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await link(inviteCode);
      await setHouseholdId(res.household_id);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.household.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.me.all });
    },
  });
}
