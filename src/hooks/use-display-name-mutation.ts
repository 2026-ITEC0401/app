import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resetDisplayName, setDisplayName } from "@/api/household";
import { queryKeys } from "@/api/query-keys";

type DisplayNameVariables = {
  householdId: string;
  memberUserId: string;
  /** null 이면 별칭 삭제(DELETE) → 가입 시 이름으로 복원 */
  displayName: string | null;
};

// 구성원 표시 이름 지정/초기화. 성공 후 구성원 목록을 무효화해 재조회한다.
export function useDisplayNameMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdId,
      memberUserId,
      displayName,
    }: DisplayNameVariables) =>
      displayName === null
        ? resetDisplayName(householdId, memberUserId)
        : setDisplayName(householdId, memberUserId, displayName),
    onSuccess: (_data, { householdId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.household.members(householdId),
      });
    },
  });
}
