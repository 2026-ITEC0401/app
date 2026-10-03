import { useMutation } from "@tanstack/react-query";

import { changePassword } from "@/api/me";

// 비밀번호 변경 §4.5. 성공 시 토큰이 전면 무효화되므로 화면에서 clearAuth() 후 재로그인으로 보낸다.
// 검증 실패는 ApiHttpError.field_errors(current_password · new_password) 로 온다.
export function useChangePasswordMutation() {
  return useMutation({ mutationFn: changePassword });
}
