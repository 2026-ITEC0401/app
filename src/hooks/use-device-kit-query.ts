import { skipToken, useQuery } from "@tanstack/react-query";

import { getDeviceKit } from "@/api/device-kit";
import { queryKeys } from "@/api/query-keys";

/**
 * 가구 키트 등록 상태 (GET /households/{id}/device-kit).
 * 키트 등록 화면들 · 기기 관리 상단 카드가 같은 캐시를 본다. 등록 확정 응답이 같은 구조라
 * 등록 mutation 이 이 캐시를 직접 갱신한다. householdId 가 없으면(미연동) 조회하지 않는다.
 */
export function useDeviceKitQuery(householdId: string | null) {
  return useQuery({
    queryKey: queryKeys.deviceKit.status(householdId ?? ""),
    queryFn: householdId ? () => getDeviceKit(householdId) : skipToken,
  });
}
