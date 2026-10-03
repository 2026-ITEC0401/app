import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/api/auth";

// 로그아웃 §4.3. 서버 폐기 성공·실패와 무관하게 로컬 토큰은 api/auth.ts 가 정리하므로,
// 여기서도 결과와 무관하게(onSettled) 캐시를 전부 비워 다음 계정에 이전 데이터가 보이지 않게 한다.
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
    },
  });
}
