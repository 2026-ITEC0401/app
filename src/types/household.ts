// 명세 §5 역할. owner = 청각장애인 당사자, member = 가족·보호자
export type HouseholdRole = "owner" | "member";

// 명세 §5.8 긴급 신고 주소 (가구 단위 저장)
export interface EmergencyAddress {
  postal_code: string;
  road_address: string;
  detail_address: string;
}

// 명세 §5.5 가족 구성원
export interface HouseholdMember {
  user_id: string;
  // 가입 시 실제 이름 (표시 이름 초기화 시 복원되는 값)
  profile_name: string;
  // 호출자에게 적용된 표시 이름. 별칭이 없으면 profile_name과 동일
  display_name: string;
  // display_name이 호출자가 지정한 개인 별칭인지 여부
  display_name_is_custom: boolean;
  phone_number: string;
  role: HouseholdRole;
  linked_at: string;
  // 현재 로그인 사용자 본인 여부
  is_me: boolean;
  // 이 구성원의 표시 이름을 편집할 수 있는지 (본인 카드는 false)
  can_edit_display_name: boolean;
}

// 명세 §5.5 GET /households/{id}/members
export interface MembersResponse {
  members: HouseholdMember[];
}

// 명세 §5.1 GET /households/current
export interface CurrentHouseholdResponse {
  household_link_status: "linked" | "unlinked";
  household: {
    household_id: string;
    name: string;
    member_count: number;
    created_at: string;
  } | null;
  membership: {
    role: HouseholdRole;
    linked_at: string;
  } | null;
  onboarding: {
    required: boolean;
    missing_steps: string[];
    next_action: "register_emergency_address" | "wait_for_owner" | null;
    can_edit_emergency_address: boolean;
  } | null;
}

// 명세 §5.2 GET /households/{id}/invite-code · rotate
export interface InviteCodeResponse {
  invite_code: string;
  expires_at: string;
}

// 명세 §5.3 / §5.4 초대 코드 요청
export interface HouseholdLinkRequest {
  invite_code: string;
}

export interface HouseholdPreviewInfo {
  name: string;
  member_count: number;
  created_at: string;
}

// 명세 §5.3 초대 코드로 가구 미리보기
// linkable이 false일 때 대비 null (명세에는 없긴함)
export interface HouseholdLinkPreview {
  linkable: boolean;
  household: HouseholdPreviewInfo | null;
}

// 명세 §5.4 가구 연동
export interface HouseholdLinkResponse {
  household_link_status: "linked";
  household_id: string;
  role: HouseholdRole;
  linked_at: string;
}

// 명세 §5.9 도로명주소 검색 결과 항목
export interface AddressSearchItem {
  postal_code: string;
  road_address: string;
  building_name: string | null;
  detail_supported: boolean;
  provider_reference: ProviderReference;
}

export interface ProviderReference {
  adm_cd: string;
  road_name_code: string;
  underground: string;
  building_main_no: number;
  building_sub_no: number;
  apartment: boolean;
}

// 검색 응답 전체
export interface AddressSearchResponse {
  page: number;
  page_size: number;
  total_count: number;
  items: AddressSearchItem[];
}
