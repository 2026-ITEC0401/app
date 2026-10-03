// 도메인별 React Query 키 팩토리. 무효화(invalidate) 범위를 계층으로 잡을 수 있게 한다.
// 예: queryClient.invalidateQueries({ queryKey: queryKeys.device.all })
export const queryKeys = {
  me: {
    all: ["me"] as const,
    profile: () => ["me", "profile"] as const,
  },
  household: {
    all: ["household"] as const,
    current: () => ["household", "current"] as const,
    members: (householdId: string) =>
      ["household", householdId, "members"] as const,
    emergencyAddress: (householdId: string) =>
      ["household", householdId, "emergencyAddress"] as const,
    inviteCode: (householdId: string) =>
      ["household", householdId, "inviteCode"] as const,
    // 초대 코드 미리보기. 초대 코드 입력 화면이 채우고 가구 연동 화면이 같은 캐시를 읽는다.
    linkPreview: (inviteCode: string) =>
      ["household", "linkPreview", inviteCode] as const,
  },
  device: {
    all: ["device"] as const,
    list: (householdId: string) => ["device", "list", householdId] as const,
  },
  alarm: {
    all: ["alarm"] as const,
    latest: (householdId: string) => ["alarm", "latest", householdId] as const,
    history: (householdId: string) =>
      ["alarm", "history", householdId] as const,
    unreadCount: (householdId: string) =>
      ["alarm", "unreadCount", householdId] as const,
    detail: (householdId: string, alarmId: string) =>
      ["alarm", "detail", householdId, alarmId] as const,
  },
} as const;
