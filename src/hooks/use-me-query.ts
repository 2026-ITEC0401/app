import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/api/me";
import { queryKeys } from "@/api/query-keys";

// §4.4 내 정보. 설정 탭(이름)과 개인정보 조회가 같은 캐시를 쓴다.
export function useMeQuery() {
  return useQuery({ queryKey: queryKeys.me.profile(), queryFn: getMe });
}
