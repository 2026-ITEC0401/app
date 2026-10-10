import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "@/api/auth";
import { queryKeys } from "@/api/query-keys";

// 로그인 §4.2. 성공 시 토큰·가구 세션은 api/auth.ts 가 저장한다.
// 다른 계정으로 다시 로그인했을 수 있으므로 사용자·가구 캐시를 무효화해 재조회하게 한다.
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.household.all });
    },
  });
}
