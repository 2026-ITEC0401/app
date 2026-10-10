import { skipToken, useQuery } from "@tanstack/react-query";

import { getEmergencyAddress } from "@/api/household";
import { ApiHttpError } from "@/api/http-error";
import { queryKeys } from "@/api/query-keys";
import type { EmergencyAddress } from "@/types/household";

// §5.8 긴급 신고 주소. 미등록이면 서버가 404 를 주므로 에러가 아니라 null 로 돌려준다.
async function fetchEmergencyAddress(
  householdId: string,
): Promise<EmergencyAddress | null> {
  try {
    return await getEmergencyAddress(householdId);
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export function useEmergencyAddressQuery(householdId: string | null) {
  return useQuery({
    queryKey: queryKeys.household.emergencyAddress(householdId ?? ""),
    queryFn: householdId ? () => fetchEmergencyAddress(householdId) : skipToken,
  });
}
