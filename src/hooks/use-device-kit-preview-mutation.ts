import { useMutation } from "@tanstack/react-query";

import { previewDeviceKitClaim } from "@/api/device-kit";
import type { DeviceKitClaimRequest } from "@/types/device-kit";

type PreviewVariables = {
  householdId: string;
  body: DeviceKitClaimRequest;
};

/**
 * 입력한 키트 확인 (POST …/device-kit/claim/preview, owner 전용).
 * 등록 코드가 본문에 실리므로 쿼리 캐시에 두지 않고 mutation 으로 호출한다.
 * 결과는 화면이 stores/device-kit-claim.ts 에 올려 확인 화면으로 넘긴다.
 */
export function useDeviceKitPreviewMutation() {
  return useMutation({
    mutationFn: ({ householdId, body }: PreviewVariables) =>
      previewDeviceKitClaim(householdId, body),
  });
}
