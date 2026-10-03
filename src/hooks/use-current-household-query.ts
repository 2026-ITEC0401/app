import { useQuery } from "@tanstack/react-query";

import { getCurrentHousehold } from "@/api/household";
import { queryKeys } from "@/api/query-keys";

/**
 * 명세 §5.1 GET /households/current 공유 훅 (웹 원본 hooks/useCurrentHousehold.ts).
 * owner/member 분기(§10.2)와 가구 표시 정보를 여러 화면에서 재사용한다.
 * 쿼리 결과에 role · isOwner 를 덧붙여 돌려준다.
 */
export function useCurrentHouseholdQuery() {
  const query = useQuery({
    queryKey: queryKeys.household.current(),
    queryFn: getCurrentHousehold,
  });
  const role = query.data?.membership?.role ?? null;
  return { ...query, role, isOwner: role === "owner" };
}
