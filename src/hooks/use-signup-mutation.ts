import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signup } from "@/api/auth";
import { queryKeys } from "@/api/query-keys";

// 회원가입 §4.1. 성공 시 바로 로그인 상태가 되므로 로그인과 같은 캐시 무효화를 한다.
export function useSignupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.household.all });
    },
  });
}
