import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  AddressSearchItem,
  AddressSearchResponse,
  CurrentHouseholdResponse,
  EmergencyAddress,
  HouseholdLinkPreview,
  HouseholdLinkResponse,
  InviteCodeResponse,
  MembersResponse,
} from "@/types/household";

// household 도메인 (웹 원본 api/householdApi.ts)

// §5.1 현재 가구 조회. owner/member 분기와 온보딩(주소 등록 필요 여부)의 출처.
export async function getCurrentHousehold(): Promise<CurrentHouseholdResponse> {
  const { data } = await apiClient.get<CurrentHouseholdResponse>(
    API_ENDPOINTS.household.current,
  );
  return data;
}

// §5.5 가족 구성원 목록
export async function getMembers(
  householdId: string,
): Promise<MembersResponse> {
  const { data } = await apiClient.get<MembersResponse>(
    API_ENDPOINTS.household.members(householdId),
  );
  return data;
}

// 구성원 표시 이름(별칭) 지정 — 호출자 화면에서만 보인다
export async function setDisplayName(
  householdId: string,
  memberUserId: string,
  displayName: string,
): Promise<void> {
  await apiClient.patch(
    API_ENDPOINTS.household.displayName(householdId, memberUserId),
    { display_name: displayName },
  );
}

// 별칭 삭제 → 가입 시 이름(profile_name)으로 복원
export async function resetDisplayName(
  householdId: string,
  memberUserId: string,
): Promise<void> {
  await apiClient.delete(
    API_ENDPOINTS.household.displayName(householdId, memberUserId),
  );
}

// §5.2 초대 코드 조회 (owner 전용)
export async function getInviteCode(
  householdId: string,
): Promise<InviteCodeResponse> {
  const { data } = await apiClient.get<InviteCodeResponse>(
    API_ENDPOINTS.household.inviteCode(householdId),
  );
  return data;
}

// 초대 코드 재발급 — 되돌릴 수 없음. 기존 코드 즉시 폐기.
export async function rotateInviteCode(
  householdId: string,
): Promise<InviteCodeResponse> {
  const { data } = await apiClient.post<InviteCodeResponse>(
    API_ENDPOINTS.household.rotateInviteCode(householdId),
  );
  return data;
}

// §5.3 초대 코드로 가구 미리보기 (연동 가능 여부 + 가구 요약)
export async function linkPreview(
  inviteCode: string,
): Promise<HouseholdLinkPreview> {
  const { data } = await apiClient.post<HouseholdLinkPreview>(
    API_ENDPOINTS.household.linkPreview,
    { invite_code: inviteCode },
  );
  return data;
}

// §5.4 가구 연동. 성공 시 household_id 가 오므로 호출부에서 세션에 올린다.
export async function link(inviteCode: string): Promise<HouseholdLinkResponse> {
  const { data } = await apiClient.post<HouseholdLinkResponse>(
    API_ENDPOINTS.household.link,
    { invite_code: inviteCode },
  );
  return data;
}

// §5.8 긴급 신고 주소 조회. 미등록이면 404 — 호출부에서 null 로 받는다.
export async function getEmergencyAddress(
  householdId: string,
): Promise<EmergencyAddress> {
  const { data } = await apiClient.get<EmergencyAddress>(
    API_ENDPOINTS.household.emergencyAddress(householdId),
  );
  return data;
}

export interface UpdateEmergencyAddressRequest {
  postal_code: string;
  road_address: string;
  detail_address: string;
  address_provider: "juso_go_kr";
  provider_reference: AddressSearchItem["provider_reference"];
  detail_source: "manual";
}

// §5.8 긴급 주소 등록·수정 (owner 전용)
export async function updateEmergencyAddress(
  householdId: string,
  body: UpdateEmergencyAddressRequest,
): Promise<void> {
  await apiClient.patch(
    API_ENDPOINTS.household.emergencyAddress(householdId),
    body,
  );
}

const ADDRESS_SEARCH_PAGE_SIZE = 10;

// §5.9 도로명주소 검색 (owner 전용). 첫 페이지 10건만 쓴다 (웹과 동일).
export async function searchRoadAddress(
  householdId: string,
  keyword: string,
): Promise<AddressSearchResponse> {
  const { data } = await apiClient.post<AddressSearchResponse>(
    API_ENDPOINTS.household.addressSearch(householdId),
    { keyword, page: 1, page_size: ADDRESS_SEARCH_PAGE_SIZE },
  );
  return data;
}
