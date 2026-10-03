import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateEmergencyAddress,
  type UpdateEmergencyAddressRequest,
} from "@/api/household";
import { queryKeys } from "@/api/query-keys";

type UpdateEmergencyAddressVariables = {
  householdId: string;
  body: UpdateEmergencyAddressRequest;
};

// §5.8 긴급 주소 등록·수정 (owner 전용).
// 성공하면 온보딩(next_action)이 바뀌므로 현재 가구와 주소 캐시를 무효화한다.
export function useUpdateEmergencyAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, body }: UpdateEmergencyAddressVariables) =>
      updateEmergencyAddress(householdId, body),
    onSuccess: (_data, { householdId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.household.current(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.household.emergencyAddress(householdId),
      });
    },
  });
}
