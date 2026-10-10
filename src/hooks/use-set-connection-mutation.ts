import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setConnection } from "@/api/device";
import { queryKeys } from "@/api/query-keys";

type SetConnectionVariables = {
  householdId: string;
  deviceId: string;
  enabled: boolean;
};

/**
 * §6.2 MQTT 연결 켜기/끄기 (owner 전용).
 * 응답 바디를 믿지 않고(스키마 미정의) 성공 후 기기 목록을 무효화해 서버 상태로 재확정한다.
 * 낙관적 업데이트는 하지 않는다 — 요청이 성공해도 기기가 heartbeat 를 안 보내면 상태가 그대로다.
 */
export function useSetConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, deviceId, enabled }: SetConnectionVariables) =>
      setConnection(householdId, deviceId, enabled),
    onSuccess: (_data, { householdId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.device.list(householdId),
      });
    },
  });
}
