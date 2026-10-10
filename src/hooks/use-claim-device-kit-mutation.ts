import { useMutation, useQueryClient } from "@tanstack/react-query";

import { claimDeviceKit } from "@/api/device-kit";
import { queryKeys } from "@/api/query-keys";
import { clearDeviceKitDraft } from "@/stores/device-kit-claim";
import type { DeviceKitClaimRequest } from "@/types/device-kit";

type ClaimVariables = {
  householdId: string;
  body: DeviceKitClaimRequest;
};

/**
 * 키트 등록 확정 (POST …/device-kit/claim, owner 전용).
 * 응답이 등록 상태 조회와 같은 구조라 캐시를 그 값으로 바로 바꾼다 (명세: 응답으로 화면 갱신).
 * 성공하면 등록 코드를 메모리에서 지운다. 기기 목록은 hardware_id 가 붙었을 수 있어 재조회시킨다.
 */
export function useClaimDeviceKitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, body }: ClaimVariables) =>
      claimDeviceKit(householdId, body),
    onSuccess: (data, { householdId }) => {
      clearDeviceKitDraft();
      queryClient.setQueryData(queryKeys.deviceKit.status(householdId), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.device.list(householdId),
      });
    },
  });
}
