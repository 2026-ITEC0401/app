import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAccount } from "@/api/me";

// 회원 탈퇴 DELETE /me. 성공 시 api/me.ts 가 토큰·세션을 지우므로 여기선 캐시만 비운다.
// 실패하면 계정·세션은 그대로다 (화면에서 비밀번호 불일치 등 안내).
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
