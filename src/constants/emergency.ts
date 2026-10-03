import { type EmergencyAddress } from "@/types/household";

// 디스커션 결론: 신고 대상은 119로 통일 (107은 제거, 112는 사용하지 않음)
export const EMERGENCY_NUMBER = "119";

// 영상통화 요청 문구는 주소·상황 템플릿과 섞이면 상황실이 혼동하므로 별도 버튼으로 분리
export const VIDEO_CALL_REQUEST_BODY = "아이폰 영상통화 요청";

// 화재·가스로 단정하지 않고 "비상벨·경보음"으로 표현한다 (백엔드 검토 의견)
export function buildReportBody(
  address: EmergencyAddress,
  stamp: string,
  sound: string,
): string {
  return [
    "[긴급] 청각장애인 비상벨·경보음 감지",
    `주소: ${address.road_address}, ${address.detail_address}`,
    `상황: ${stamp} ${sound} 감지됨`,
    "청각장애인으로 통화 불가. 문자로 연락 바랍니다.",
  ].join("\n");
}

export function buildFamilyNoticeBody(stamp: string, location: string): string {
  return `집에서 비상벨·경보음이 감지됐어요. (${stamp}, ${location})`;
}
