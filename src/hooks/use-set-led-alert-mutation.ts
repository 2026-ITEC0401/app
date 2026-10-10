import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setLedAlert } from "@/api/device";
import { queryKeys } from "@/api/query-keys";

type SetLedAlertVariables = {
  householdId: string;
  deviceId: string;
  enabled: boolean;
};

// §6.3 LED 알림 켜기/끄기 (owner 전용). 성공 후 기기 목록을 무효화해 서버 상태로 재확정한다.
export function useSetLedAlertMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, deviceId, enabled }: SetLedAlertVariables) =>
      setLedAlert(householdId, deviceId, enabled),
    onSuccess: (_data, { householdId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.device.list(householdId),
      });
    },
  });
}
