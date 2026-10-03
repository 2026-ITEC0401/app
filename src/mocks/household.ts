import type { AuthUser } from "@/types/auth";
import type {
  AddressSearchItem,
  CurrentHouseholdResponse,
  EmergencyAddress,
  HouseholdLinkPreview,
  HouseholdMember,
  InviteCodeResponse,
} from "@/types/household";

// 화면 골격용 더미 데이터 (명세 §4·§5). API 연동 시 이 파일만 지우면 된다.

export const MOCK_ME: AuthUser = {
  user_id: "user-a1b2",
  login_id: "hearo_user01",
  name: "홍길동",
  phone_number: "+821012345678",
  account_type: "household_owner",
  household_id: "home-a1b2c3",
  role: "owner",
  household_link_status: "linked",
  created_at: "2026-08-29T03:00:00Z",
};

export const MOCK_CURRENT_HOUSEHOLD: CurrentHouseholdResponse = {
  household_link_status: "linked",
  household: {
    household_id: "home-a1b2c3",
    name: "복현동 홍길동 가구",
    member_count: 3,
    created_at: "2026-08-17T03:00:00Z",
  },
  membership: {
    role: "owner",
    linked_at: "2026-08-17T03:00:00Z",
  },
  onboarding: {
    required: false,
    missing_steps: [],
    next_action: null,
    can_edit_emergency_address: true,
  },
};

export const MOCK_MEMBERS: HouseholdMember[] = [
  {
    user_id: "user-a1b2",
    profile_name: "홍길동",
    display_name: "홍길동",
    display_name_is_custom: false,
    phone_number: "01012345678",
    role: "owner",
    linked_at: "2026-08-17T03:00:00Z",
    is_me: true,
    can_edit_display_name: false,
  },
  {
    user_id: "user-a1b3",
    profile_name: "홍영희",
    display_name: "엄마",
    display_name_is_custom: true,
    phone_number: "01023456789",
    role: "member",
    linked_at: "2026-08-17T04:00:00Z",
    is_me: false,
    can_edit_display_name: true,
  },
  {
    user_id: "user-a1b4",
    profile_name: "홍철수",
    display_name: "홍철수",
    display_name_is_custom: false,
    phone_number: "01034567890",
    role: "member",
    linked_at: "2026-08-18T01:00:00Z",
    is_me: false,
    can_edit_display_name: true,
  },
];

export const MOCK_EMERGENCY_ADDRESS: EmergencyAddress = {
  postal_code: "05029",
  road_address: "서울특별시 광진구 능동로 120",
  detail_address: "101동 1001호",
};

// 명세 §5.2 GET /households/{id}/invite-code
export const MOCK_INVITE_CODE: InviteCodeResponse = {
  invite_code: "A1B2C3",
  expires_at: "2026-10-04T05:03:00Z",
};

// 명세 §5.3 POST /households/link/preview — 연동 가능한 가구 미리보기
export const MOCK_LINK_PREVIEW: HouseholdLinkPreview = {
  linkable: true,
  household: {
    name: "복현동 홍길동 가구",
    member_count: 3,
    created_at: "2026-08-17T03:00:00Z",
  },
};

// 명세 §5.9 도로명 검색 결과
export const MOCK_ADDRESS_RESULTS: AddressSearchItem[] = [
  {
    postal_code: "05029",
    road_address: "서울특별시 광진구 능동로 120",
    building_name: "건국대학교",
    detail_supported: false,
    provider_reference: {
      adm_cd: "1121510700",
      road_name_code: "112153104007",
      underground: "0",
      building_main_no: 120,
      building_sub_no: 0,
      apartment: false,
    },
  },
  {
    postal_code: "05030",
    road_address: "서울특별시 광진구 능동로 120-1",
    building_name: "건국대학교병원",
    detail_supported: false,
    provider_reference: {
      adm_cd: "1121510700",
      road_name_code: "112153104007",
      underground: "0",
      building_main_no: 120,
      building_sub_no: 1,
      apartment: false,
    },
  },
  {
    postal_code: "04987",
    road_address: "서울특별시 광진구 능동로34길 120",
    building_name: null,
    detail_supported: false,
    provider_reference: {
      adm_cd: "1121510200",
      road_name_code: "112154112144",
      underground: "0",
      building_main_no: 120,
      building_sub_no: 0,
      apartment: false,
    },
  },
];
