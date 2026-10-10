import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

import { linkPreview } from "@/api/household";
import { queryKeys } from "@/api/query-keys";

/**
 * §5.3 초대 코드 미리보기 옵션.
 * 웹은 location.state 로 preview 를 다음 화면에 넘겼지만 expo-router 는 URL 파라미터만 받으므로,
 * 초대 코드 입력 화면이 queryClient.fetchQuery(이 옵션) 로 캐시를 채우고
 * 가구 연동 화면이 useLinkPreviewQuery 로 같은 캐시를 읽는다.
 */
export function linkPreviewQueryOptions(inviteCode: string) {
  return queryOptions({
    queryKey: queryKeys.household.linkPreview(inviteCode),
    queryFn: () => linkPreview(inviteCode),
  });
}

export function useLinkPreviewQuery(inviteCode: string | null) {
  return useQuery({
    queryKey: queryKeys.household.linkPreview(inviteCode ?? ""),
    queryFn: inviteCode ? () => linkPreview(inviteCode) : skipToken,
  });
}
