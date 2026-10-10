// 도메인별 API 엔드포인트. path 파라미터가 있으면 함수로 둔다.
// 웹 원본 src/api/*Api.ts 에 흩어져 있던 경로를 한곳에 모았다. baseURL 은 apiClient 가 붙인다.
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login", // §4.2
    refresh: "/auth/refresh", // access 재발급
    logout: "/auth/logout", // §4.3 refresh 폐기
    signup: "/auth/signup", // §4.1
  },
  me: {
    base: "/me", // §4.4 GET · DELETE(회원 탈퇴, 바디에 current_password)
    password: "/me/password", // §4.5 PATCH
  },
  household: {
    current: "/households/current", // §5.1
    linkPreview: "/households/link/preview", // §5.3 POST
    link: "/households/link", // §5.4 POST
    members: (householdId: string) => `/households/${householdId}/members`, // §5.5
    displayName: (householdId: string, memberUserId: string) =>
      `/households/${householdId}/members/${memberUserId}/display-name`, // PATCH · DELETE
    inviteCode: (householdId: string) =>
      `/households/${householdId}/invite-code`, // §5.2 GET
    rotateInviteCode: (householdId: string) =>
      `/households/${householdId}/invite-code/rotate`, // POST (되돌릴 수 없음)
    emergencyAddress: (householdId: string) =>
      `/households/${householdId}/emergency-address`, // §5.8 GET · PATCH
    addressSearch: (householdId: string) =>
      `/households/${householdId}/address-search/roads`, // §5.9 POST
  },
  device: {
    list: (householdId: string) => `/households/${householdId}/devices`, // §6.1
    connection: (householdId: string, deviceId: string) =>
      `/households/${householdId}/devices/${deviceId}/connection`, // §6.2 PATCH
    settings: (householdId: string, deviceId: string) =>
      `/households/${householdId}/devices/${deviceId}/settings`, // §6.3 PATCH
  },
  // 기기 키트 등록 (DEVICE_KIT_API_SPEC). 신규 API 배포 전에는 경로가 없다 (404).
  deviceKit: {
    status: (householdId: string) => `/households/${householdId}/device-kit`, // GET
    claimPreview: (householdId: string) =>
      `/households/${householdId}/device-kit/claim/preview`, // POST (owner, DB 변경 없음)
    claim: (householdId: string) =>
      `/households/${householdId}/device-kit/claim`, // POST (owner, 멱등)
  },
  alarm: {
    latest: (householdId: string) => `/households/${householdId}/alarms/latest`, // §7.2
    history: (householdId: string) =>
      `/households/${householdId}/alarms/history`, // §7.3
    detail: (householdId: string, alarmId: string) =>
      `/households/${householdId}/alarms/${alarmId}`, // §7.4
    unreadCount: (householdId: string) =>
      `/households/${householdId}/alarms/unread-count`,
    seen: (householdId: string) => `/households/${householdId}/alarms/seen`, // PATCH
  },
  ws: {
    household: (householdId: string) => `/ws/households/${householdId}`, // §9
  },
} as const;
