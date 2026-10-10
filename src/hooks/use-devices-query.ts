import { skipToken, useQuery } from "@tanstack/react-query";

import { getDevices } from "@/api/device";
import { queryKeys } from "@/api/query-keys";

// §6.1 기기 목록. 홈 · 설정 · 기기 관리 · 기기 상세가 같은 캐시를 공유한다.
// householdId 가 없으면(미연동) 조회하지 않는다.
export function useDevicesQuery(householdId: string | null) {
  return useQuery({
    queryKey: queryKeys.device.list(householdId ?? ""),
    queryFn: householdId ? () => getDevices(householdId) : skipToken,
  });
}
